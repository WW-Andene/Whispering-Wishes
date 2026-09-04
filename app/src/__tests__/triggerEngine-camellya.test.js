/**
 * Phase 2 trigger-engine parity test — Camellya (third schema extension: same-
 * character no-time-limit cast-order dependency, PLUS the multi-skill-shared-node
 * case resolved by splitting one Resonance Chain node into two blocks).
 */
import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA, SKILL_MULTIPLIERS, CHARACTER_ROTATIONS } from '../data/characters.js';
import { CAMELLYA_BLOCKS } from '../engine/characterBlocks/camellya.blocks.js';
import { parseSkillMultiplierHits } from '../engine/skillMultiplierParser.js';
import { requiredSequenceOf } from '../engine/sequenceGating.js';

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
    // S3's node holds two independently-conditioned real effects (Fervor Efflorescent's unconditional
    // totalMult +50%, and a Budding-Mode-only ATK +58%) — split across 2 blocks, see chain.s3-fervor-mult.
    expect(byId('camellya.chain.s3-fervor-mult').effects[0].value).toBe(rc.s3.totalMult);
    const s3 = byId('camellya.chain.s3-a-bud-adorned-by-thorns');
    expect(s3.effects.find(e => e.stat === 'atkPct').value).toBe(rc.s3.atkPct);
    expect(s3.condition).toEqual({ requiresStance: 'Budding Mode' });
    expect(byId('camellya.chain.s4-roots-set-deep-in-eternity').effects[0].value).toBe(rc.s4.basicDmg);
    const s6 = byId('camellya.chain.s6-bloom-for-you-thousand-times-over');
    expect(s6.effects.every(e => e.stat === 'totalMult' && e.value === rc.s6.totalMult)).toBe(true);
  });

  it('Basic-ATK-type moves (Crimson Blossom, Vining Waltz combo, Ephemeral, Floral Ravage) are basicDmg, not skillDmg, per kit text overrides and the dump\'s 0% Skill / 67.1% Basic Damage Profile', () => {
    const basicIds = [
      'camellya.basic.vining-waltz-1',
      'camellya.skill.crimson-blossom',
      'camellya.skill.vining-waltz-combo',
      'camellya.forte.ephemeral',
      'camellya.skill.floral-ravage',
    ];
    for (const id of basicIds) {
      expect(CAMELLYA_BLOCKS.find(b => b.id === id).damage.category).toBe('basicDmg');
    }
    expect(CAMELLYA_BLOCKS.some(b => b.damage?.category === 'skillDmg')).toBe(false);
  });

  it('Chain totalMult buffs are scoped via scopedToBlockId, not applied unscoped across the whole kit', () => {
    const byId = id => CAMELLYA_BLOCKS.find(b => b.id === id);
    expect(byId('camellya.chain.s2-calling-upon-the-silent-rose').effects[0].scopedToBlockId).toBe('camellya.forte.ephemeral');
    expect(byId('camellya.chain.s3-fervor-mult').effects[0].scopedToBlockId).toBe('camellya.liberation.fervor-efflorescent');
    expect(byId('camellya.chain.s5-everblooming').effects[0].scopedToBlockId).toBe('camellya.intro.everblooming');
    const twiningScopes = byId('camellya.chain.s5-twining').effects.map(e => e.scopedToBlockId).sort();
    expect(twiningScopes).toEqual(['camellya.outro.twining-base', 'camellya.outro.twining-ephemeral-bonus'].sort());
    const bloomScopes = byId('camellya.chain.s6-bloom-for-you-thousand-times-over').effects.map(e => e.scopedToBlockId).sort();
    expect(bloomScopes).toEqual(['camellya.skill.floral-ravage', 'camellya.skill.vining-waltz-combo'].sort());
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

  it('Floral Ravage damage block exists and matches its now-added SKILL_MULTIPLIERS row (was a 0-DMG rotation step)', () => {
    const row = SKILL_MULTIPLIERS['Camellya'].find(r => r[1] === 'Floral Ravage');
    expect(row).toBeTruthy();
    const block = CAMELLYA_BLOCKS.find(b => b.id === 'camellya.skill.floral-ravage');
    expect(block).toBeTruthy();
    expect(block.trigger).toEqual({ type: 'cast', on: 'Skill:Floral Ravage' });
    expect(block.damage.hits).toEqual(parseSkillMultiplierHits(row[2]));
    // The rotation actually casts this step — confirms it's not a dead/unused row.
    const usesIt = CHARACTER_ROTATIONS['Camellya'].some(step => step.type === 'Skill' && step.skill === 'Floral Ravage');
    expect(usesIt).toBe(true);
  });

  it('S6 Forte Circuit: Perennial deals 100% of Ephemeral\'s own DMG as basicDmg, gated to sequence 6', () => {
    const ephemeral = CAMELLYA_BLOCKS.find(b => b.id === 'camellya.forte.ephemeral');
    const perennial = CAMELLYA_BLOCKS.find(b => b.id === 'camellya.chain.s6-perennial');
    const ephemeralTotal = ephemeral.damage.hits.reduce((sum, h) => sum + h.atkPct, 0);
    const perennialTotal = perennial.damage.hits.reduce((sum, h) => sum + h.atkPct, 0);
    expect(perennialTotal).toBeCloseTo(ephemeralTotal, 5);
    expect(perennial.damage.category).toBe('basicDmg');
    expect(requiredSequenceOf(perennial)).toBe(6);
  });
});
