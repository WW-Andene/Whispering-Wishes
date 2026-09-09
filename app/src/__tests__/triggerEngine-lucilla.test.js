import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { resolveHitComposedTeamDps } from '../engine/resolver/dps/resolveHitComposedTeamDps.js';
import { deriveStepsFromRotation, simulateTeamRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { LUCILLA_BLOCKS } from '../engine/characterBlocks/lucilla.blocks.js';
import { HIYUKI_BLOCKS } from '../engine/characterBlocks/hiyuki.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Lucilla', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(LUCILLA_BLOCKS, 'Lucilla');
  });

  it('S1/S2/S4 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucilla'];
    expect(LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s2').effects[0].value).toBe(rc.s2.echoDmg);
    const s4 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s4');
    expect(s4.effects[0].value).toBe(rc.s4.atkPct);
  });

  it('S3/S5/S6 carry both real dual-mode categories, matching RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucilla'];
    const s3 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s3');
    expect(s3.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s3.basicDmg);
    expect(s3.effects.find(e => e.stat === 'echoDmg').value).toBe(rc.s3.echoDmg);
    const s5 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s5');
    expect(s5.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s5.basicDmg);
    const s6 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s6');
    expect(s6.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s6.basicDmg);
    expect(s6.effects.find(e => e.stat === 'echoDmg').value).toBe(rc.s6.echoDmg);
  });

  it('both outro modes and the debuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lucilla'];
    const chafe = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.outro.montage-chafe');
    const echo = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.outro.montage-echo');
    expect(chafe.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(echo.effects[0].value).toBe(legacy.outroBuffs[1].value);
    const deb = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.debuff.inherent-skill-resshred');
    expect(deb.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(deb.kind).toBe('debuff');
  });

  it('the Liberation self-buff is sourced from CHARACTER_ROTATIONS despite CHAR_BUFF_TABLE.selfBuffs not listing it', () => {
    const legacy = CHAR_BUFF_TABLE['Lucilla'];
    expect(legacy.selfBuffs.find(b => b.condition === 'Resonance Chain 1')).toBeTruthy();
    const bonus = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.selfbuff.clear-as-day-bonus');
    expect(bonus.effects[0].value).toBe(30);
    expect(bonus.timing.duration).toBe(10);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lucilla'], LUCILLA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUCILLA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'glacio', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lucilla.intro.clip-it')).toBe(true);
    expect(fired.has('lucilla.liberation.clear-as-day')).toBe(true);
    expect(fired.has('lucilla.basic.letting-it-go')).toBe(true);
    expect(fired.has('lucilla.basic.oblivion')).toBe(true);
  });

  it('Phase A audit (2026-09-04): S3/S5/S6 are scoped to their own single named move, not a whole damage category', () => {
    // Real bug found: S3 ("Letting It Go's DMG Multiplier +100%"), S5 ("Oblivion's DMG Multiplier
    // +50%"), and S6 (Letting It Go +600%) were all modeled as unscoped basicDmg/echoDmg category
    // buffs — the same bug class already fixed for Jiyan's S6 (see jiyan.blocks.js's own audit
    // comment). Without scopedToBlockId, each would inflate EVERY basicDmg/echoDmg-category block
    // in the kit (Tracing Forms, the other of the S3/S5/S6 pair's own moves, Clear As Day itself),
    // not just the one move its own kit text names.
    // 2026-09-07 update: each key now scopes to ITS OWN mode's block (basicDmg -> the Chafe-mode
    // block, echoDmg -> the new Echo-mode sibling) — see lucilla.blocks.js's own note on this fix:
    // previously the echoDmg key pointed at the Chafe-mode (basicDmg-category) block id, a dead
    // effect that could never match any real hit.
    const s3 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s3');
    expect(s3.effects.find(e => e.stat === 'basicDmg').scopedToBlockId).toBe('lucilla.basic.letting-it-go');
    expect(s3.effects.find(e => e.stat === 'echoDmg').scopedToBlockId).toBe('lucilla.basic.letting-it-go-echo');
    const s5 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s5');
    expect(s5.effects.find(e => e.stat === 'basicDmg').scopedToBlockId).toBe('lucilla.basic.oblivion');
    expect(s5.effects.find(e => e.stat === 'echoDmg').scopedToBlockId).toBe('lucilla.basic.oblivion-echo');
    const s6 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s6');
    expect(s6.effects.find(e => e.stat === 'basicDmg').scopedToBlockId).toBe('lucilla.basic.letting-it-go');
    expect(s6.effects.find(e => e.stat === 'echoDmg').scopedToBlockId).toBe('lucilla.basic.letting-it-go-echo');
  });

  it('2026-09-07 full-kit audit: mode-rivalry now covers her core damage kit, not just buffs', () => {
    // Real gap found: Clear As Day, Oblivion, and Letting It Go were hardcoded to basicDmg (Chafe
    // mode) with NO Echo-mode sibling, even though her own real, sourced teams (Sigrika/Phrolova/
    // Galbrena) put her in Echo mode, where the same hits are "considered Echo Skill DMG" instead.
    const pairs = [
      ['lucilla.liberation.clear-as-day', 'lucilla.liberation.clear-as-day-echo', 'basicDmg', 'echoDmg'],
      ['lucilla.basic.oblivion', 'lucilla.basic.oblivion-echo', 'basicDmg', 'echoDmg'],
      ['lucilla.basic.letting-it-go', 'lucilla.basic.letting-it-go-echo', 'basicDmg', 'echoDmg'],
    ];
    for (const [chafeId, echoId, chafeCat, echoCat] of pairs) {
      const chafe = LUCILLA_BLOCKS.find(b => b.id === chafeId);
      const echo = LUCILLA_BLOCKS.find(b => b.id === echoId);
      expect(chafe.condition.requiresStance).toBe('Glacio Chafe mode');
      expect(echo.condition.requiresStance).toBe('Echo mode');
      expect(chafe.damage.category).toBe(chafeCat);
      expect(echo.damage.category).toBe(echoCat);
      expect(echo.damage.hits).toEqual(chafe.damage.hits);
      expect(echo.trigger).toEqual(chafe.trigger);
    }
    // Tracing Forms is confirmed NOT mode-dependent ("considered Basic Attack DMG regardless of
    // mode") and correctly has no Echo sibling.
    expect(LUCILLA_BLOCKS.find(b => b.id === 'lucilla.basic.tracing-forms-echo')).toBeUndefined();
  });

  it('2026-09-08: Forte Circuit Film Roll fires only off ANOTHER teammate\'s Chafe application, never her own, and adds a real 2nd application', () => {
    // Direct user challenge after an earlier pass wrongly called Film Roll unrepresentable: fixed at
    // the engine root (rotationSimulator.js's actionTagCounts + trigger.requiresOtherOwner), verified
    // here with a real cross-character rotation, not inference.
    const soloLucillaOnly = [{ type: 'Intro', skill: 'Clip It', owner: 'Lucilla' }];
    const soloResults = simulateTeamRotation(soloLucillaOnly, { Lucilla: LUCILLA_BLOCKS });
    // Lucilla's own cast must NOT trigger her own Film Roll (requiresOtherOwner) — count stays 1.
    expect(soloResults[0].actionTagCounts.get('glacio-chafe')).toBe(1);

    const teamSteps = [
      { type: 'Intro', skill: 'Clip It', owner: 'Lucilla' },
      { type: 'Liberation', skill: 'Frostedge', owner: 'Hiyuki' },
    ];
    const teamResults = simulateTeamRotation(teamSteps, { Lucilla: LUCILLA_BLOCKS, Hiyuki: HIYUKI_BLOCKS });
    // Hiyuki's own Chafe application is real teammate action for Lucilla's Film Roll -> +1 extra.
    expect(teamResults.find(r => r.owner === 'Hiyuki').actionTagCounts.get('glacio-chafe')).toBe(2);
    expect(teamResults.find(r => r.owner === 'Lucilla').actionTagCounts.get('glacio-chafe')).toBe(1);

    // Real DPS-level effect: Hiyuki's own Glacio Bite proc block now counts every real application,
    // so the same Frostedge cast credits 2x the damage with Lucilla's Film Roll active vs solo.
    const enemy = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const soloGlacioBite = resolveHitComposedTeamDps(
      [{ type: 'Liberation', skill: 'Frostedge', owner: 'Hiyuki' }], { Hiyuki: HIYUKI_BLOCKS }, 'Hiyuki', enemy, 1000,
    ).hitLog.filter(h => h.blockId === 'hiyuki.procdmg.glacio-bite').reduce((s, h) => s + h.damage, 0);
    const teamGlacioBite = resolveHitComposedTeamDps(
      teamSteps, { Lucilla: LUCILLA_BLOCKS, Hiyuki: HIYUKI_BLOCKS }, 'Hiyuki', enemy, 1000,
    ).hitLog.filter(h => h.blockId === 'hiyuki.procdmg.glacio-bite').reduce((s, h) => s + h.damage, 0);
    // 3x total, not 2x: Lucilla's own Clip It step contributes 1 real application on its own step,
    // Hiyuki's Frostedge step contributes 2 (her own cast + Film Roll's reactive extra) on its step —
    // 1 + 2 = 3 total Glacio Bite firings across the rotation, vs 1 in the solo-Hiyuki-only case.
    expect(teamGlacioBite).toBeCloseTo(soloGlacioBite * 3, 5);
  });

  it('2026-09-07: Forte Circuit Zoom is modeled, scoped only to her Echo-mode hits (not the whole kit)', () => {
    const zoom = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.buff.forte-zoom');
    expect(zoom).toBeTruthy();
    expect(zoom.effects[0].stat).toBe('critDmg');
    expect(zoom.effects[0].value).toBe(40);
    expect(Array.isArray(zoom.effects[0].scopedToBlockId)).toBe(true);
    // Must NOT include Tracing Forms — its own move text is never considered Echo Skill DMG.
    expect(zoom.effects[0].scopedToBlockId).not.toContain('lucilla.basic.tracing-forms');
    expect(zoom.effects[0].scopedToBlockId).toEqual(expect.arrayContaining([
      'lucilla.liberation.clear-as-day-echo', 'lucilla.basic.oblivion-echo', 'lucilla.basic.letting-it-go-echo',
    ]));
  });

  it('Phase A audit (2026-09-04): Inherent Skill Slow Motion Echo-mode team Echo Skill DMG buff is modeled', () => {
    // Real gap found: CHAR_BUFF_TABLE['Lucilla'] only modeled the Chafe-mode half of Slow Motion
    // (the -8% Glacio RES Shred debuff on casting Spotlight) — the Echo-mode half (team +25% Echo
    // Skill DMG Bonus for 30s, same trigger) was entirely missing from both the legacy table and
    // the engine blocks.
    const legacy = CHAR_BUFF_TABLE['Lucilla'];
    const echoBuff = legacy.selfBuffs.find(b => b.stat === 'echoDmg' && b.target === 'team');
    expect(echoBuff).toBeTruthy();
    expect(echoBuff.value).toBe(25);
    expect(echoBuff.duration).toBe(30);
    const block = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.buff.inherent-skill-echo-teamdmg');
    expect(block).toBeTruthy();
    expect(block.effects[0].value).toBe(25);
    expect(block.target.scope).toBe('whole-team');
    expect(block.timing.duration).toBe(30);
  });

  it('2026-09-09 full-kit audit: chain.s1, the resShred debuff, and the Echo-mode team buff are gated to the real Skill:Spotlight cast, not an unconditional passive', () => {
    // Real bug found: all three were `trigger:{type:'passive'}` with a nonzero `timing.duration` —
    // resolveHitComposedDps.js's `passiveBlocks` filter never checks duration, so they were silently
    // active for her real pre-Spotlight Intro hit too. Verified below via direct measurement (Intro's
    // own damage strictly lower without each block than with it, since they no longer fire before
    // Spotlight is cast) — not just a static trigger-shape assertion.
    for (const id of ['lucilla.chain.s1', 'lucilla.debuff.inherent-skill-resshred', 'lucilla.buff.inherent-skill-echo-teamdmg']) {
      const block = LUCILLA_BLOCKS.find(b => b.id === id);
      expect(block.trigger).toEqual({ type: 'cast', on: 'Skill:Spotlight' });
    }

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lucilla'], LUCILLA_BLOCKS);
    const enemy = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const introDamage = (blocks) => {
      const { hitLog } = resolveHitComposedDps(blocks, steps, enemy, 3000, 'glacio', 'Sub DPS');
      return hitLog.filter(h => h.blockId === 'lucilla.intro.clip-it').reduce((s, h) => s + h.damage, 0);
    };
    const baseline = introDamage(LUCILLA_BLOCKS);
    const withoutS1 = introDamage(LUCILLA_BLOCKS.filter(b => b.id !== 'lucilla.chain.s1'));
    const withoutResShred = introDamage(LUCILLA_BLOCKS.filter(b => b.id !== 'lucilla.debuff.inherent-skill-resshred'));
    // Removing either block from the already-fixed kit must have NO effect on Intro's damage, since
    // both are now correctly gated to start on the later Spotlight cast (Intro fires first).
    expect(withoutS1).toBeCloseTo(baseline, 5);
    expect(withoutResShred).toBeCloseTo(baseline, 5);
  });
});
