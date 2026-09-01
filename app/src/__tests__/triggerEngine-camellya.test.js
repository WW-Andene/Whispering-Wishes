/**
 * Phase 2 trigger-engine parity test — Camellya (third schema extension: same-
 * character no-time-limit cast-order dependency, PLUS the multi-skill-shared-node
 * case resolved by splitting one Resonance Chain node into two blocks).
 */
import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { CAMELLYA_BLOCKS } from '../engine/characterBlocks/camellya.blocks.js';

describe('triggerEngine parity — Camellya', () => {
  it('Seedbed/Epiphyte self-buffs match CHAR_BUFF_TABLE.selfBuffs', () => {
    const [seedbed, epiphyte] = CHAR_BUFF_TABLE['Camellya'].selfBuffs;
    expect(CAMELLYA_BLOCKS.find(b => b.id === 'camellya.selfbuff.seedbed').effects[0].value).toBe(seedbed.value);
    expect(CAMELLYA_BLOCKS.find(b => b.id === 'camellya.selfbuff.epiphyte').effects[0].value).toBe(epiphyte.value);
  });

  it('Resonance Chain S1-S4/S6 values match RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Camellya'];
    const byId = id => CAMELLYA_BLOCKS.find(b => b.id === id);
    expect(byId('camellya.chain.s1-somewhere-no-one-travelled').effects[0].value).toBe(rc.s1.critDmg);
    expect(byId('camellya.chain.s2-calling-upon-the-silent-rose').effects[0].value).toBe(rc.s2.totalMult);
    const s3 = byId('camellya.chain.s3-a-bud-adorned-by-thorns');
    expect(s3.effects.find(e => e.stat === 'totalMult').value).toBe(rc.s3.totalMult);
    expect(s3.effects.find(e => e.stat === 'atkPct').value).toBe(rc.s3.atkPct);
    expect(byId('camellya.chain.s4-roots-set-deep-in-eternity').effects[0].value).toBe(rc.s4.basicDmg);
    expect(byId('camellya.chain.s6-bloom-for-you-thousand-times-over').effects[0].value).toBe(rc.s6.totalMult);
  });

  it('S5 multi-skill split: the block model represents BOTH multipliers the flat table could only hold one of', () => {
    // The flat table only ever had room for the Everblooming half (303) — Twining's +68% was
    // dropped entirely (see RESONANCE_CHAIN_DATA's own s5 comment). The block set fixes this.
    const rc = RESONANCE_CHAIN_DATA['Camellya'];
    const everblooming = CAMELLYA_BLOCKS.find(b => b.id === 'camellya.chain.s5-everblooming');
    const twining = CAMELLYA_BLOCKS.find(b => b.id === 'camellya.chain.s5-twining');
    expect(everblooming.effects[0].value).toBe(rc.s5.totalMult); // still matches the flat table's one value
    expect(twining.effects[0].value).toBe(68); // NOT present anywhere in RESONANCE_CHAIN_DATA — this is the fix
    expect(rc.s5.twining).toBeUndefined(); // proves the flat schema genuinely had no slot for this
  });

  it('Twining\'s conditional bonus block correctly names its cast-order dependency', () => {
    const block = CAMELLYA_BLOCKS.find(b => b.id === 'camellya.outro.twining-ephemeral-bonus');
    expect(block.trigger.type).toBe('requires-prior-cast');
    expect(block.trigger.requiresPriorCast).toBe('cast:Forte:Ephemeral');
  });
});
