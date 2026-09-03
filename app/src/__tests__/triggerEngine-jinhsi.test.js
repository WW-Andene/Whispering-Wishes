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
import { CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/triggerEngine.js';
import { JINHSI_BLOCKS } from '../engine/characterBlocks/jinhsi.blocks.js';

describe('triggerEngine parity — Jinhsi', () => {
  it('Radiant Surge self-buff matches CHAR_BUFF_TABLE.selfBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Jinhsi'].selfBuffs[0];
    const block = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.selfbuff.radiant-surge');
    expect(block.effects[0].value).toBe(legacy.value);
  });

  it('Resonance Chain S1-S6 values match RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Jinhsi'];
    const byId = id => JINHSI_BLOCKS.find(b => b.id === id);
    expect(byId('jinhsi.chain.s1-abyssal-ascension').effects[0].value).toBe(rc.s1.skillDmg);
    expect(byId('jinhsi.chain.s2-chronofrost-repose').effects[0].value).toBe(rc.s2.totalMult);
    expect(byId('jinhsi.chain.s3-celestial-incarnate').effects[0].value).toBe(rc.s3.atkPct);
    expect(byId('jinhsi.chain.s4-benevolent-grace').effects[0].value).toBe(rc.s4.elemDmg);
    expect(byId('jinhsi.chain.s5-frostfire-illumination').effects[0].value).toBe(rc.s5.libDmg);
    expect(byId('jinhsi.chain.s6-thawing-triumph').effects[0].value).toBe(rc.s6.skillDmg);
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

  it('S4 team elemDmg buff is cast-scoped-but-persistent (20s), same shape as Augusta S4/Shorekeeper S6', () => {
    // statsNoCast still picks up the always-on Radiant Surge passive (elemDmg 20) — only S4's
    // OWN contribution is gated on the Liberation cast having fired.
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
    // elemDmg accumulates both the always-on Radiant Surge (20) and S4's team buff (20) here since
    // this test resolves against Jinhsi's own block set as both self and target.
    expect(statsWithCast.elemDmg).toBe(40);
    const s4 = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.chain.s4-benevolent-grace');
    expect(s4.timing.duration).toBe(20);
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
