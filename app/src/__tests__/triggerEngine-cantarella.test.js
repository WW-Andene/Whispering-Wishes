import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { resolveHitComposedTeamDps } from '../engine/resolver/dps/resolveHitComposedTeamDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { CANTARELLA_BLOCKS } from '../engine/characterBlocks/cantarella.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Cantarella', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(CANTARELLA_BLOCKS, 'Cantarella');
  });

  it('S4/S5 stay correctly unmodeled (no block) — heal-only / hit-count-cap-only per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Cantarella'];
    expect(rc.s4).toEqual({});
    expect(rc.s5).toEqual({});
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s4')).toBeUndefined();
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s5')).toBeUndefined();
  });

  it('S1 is scoped to its 3 real moves via scopedToBlockId, matching RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Cantarella'];
    const s1 = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s1');
    expect(s1.effects).toHaveLength(3);
    for (const e of s1.effects) expect(e.value).toBe(rc.s1.totalMult);
    expect(s1.effects.map(e => e.scopedToBlockId).sort()).toEqual([
      'cantarella.forte.perception-drain',
      'cantarella.skill.flickering-reverie',
      'cantarella.skill.graceful-step',
    ]);
  });

  it('S2/S3 match RESONANCE_CHAIN_DATA exactly (S3 rescoped to basicDmg — Flowing Suffocation is "considered Basic Attack DMG")', () => {
    const rc = RESONANCE_CHAIN_DATA['Cantarella'];
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s2').effects[0].value).toBe(rc.s2.totalMult);
    const s3 = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s3');
    expect(s3.effects[0].stat).toBe('basicDmg');
    expect(s3.effects[0].value).toBe(rc.s3.basicDmg);
    expect(s3.effects[0].scopedToBlockId).toBe('cantarella.liberation.flowing-suffocation');
  });

  it('S6 is split into its two real, differently-timed effects, both matching RESONANCE_CHAIN_DATA — basic-mult scoped to Phantom Sting only', () => {
    const rc = RESONANCE_CHAIN_DATA['Cantarella'];
    const basicMult = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s6-basic-mult');
    const defIgnore = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s6-defignore');
    expect(basicMult.effects[0].value).toBe(rc.s6.basicDmg);
    expect(basicMult.effects[0].scopedToBlockId).toBe('cantarella.forte.phantom-sting');
    expect(defIgnore.effects[0].value).toBe(rc.s6.defIgnore);
    expect(defIgnore.timing.duration).toBe(10);
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s6')).toBeUndefined();
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Cantarella'];
    const outro = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.outro.gentle-tentacles');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'skillDmg').value).toBe(legacy.outroBuffs[1].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const self = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.selfbuff.inherent-skill-poison');
    expect(self.effects[0].value * self.effects[0].maxStacks).toBe(legacy.selfBuffs[0].value);
    // Retrofitted 2026-09-03 (REMAINING_WORK.md 1a): now actually clamps to the buffed Resonator's
    // own swap-out instant when shorter than the nominal 14s — see forfeitOnRecipientSwapOut.test.js
    // for the mechanism's own proof.
    expect(outro.timing.forfeitOnRecipientSwapOut).toBe(true);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Cantarella'], CANTARELLA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CANTARELLA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('cantarella.intro.ripple')).toBe(true);
    expect(fired.has('cantarella.liberation.flowing-suffocation')).toBe(true);
    expect(fired.has('cantarella.forte.phantom-sting')).toBe(true);
    expect(fired.has('cantarella.forte.perception-drain')).toBe(true);
  });

  // Closed 2026-09-03 (REMAINING_WORK.md 1a): Diffusion's off-field Coordinated ATK summon chain,
  // previously undocumented/unmodeled ("no home in this schema yet") — now a real crossCharacterHit
  // windowed-proc block, sourced verbatim from SKILL_MULTIPLIERS['Cantarella']'s own Liberation row
  // ('376.00% + 14.54%×21').
  it('Diffusion is a real windowed-proc block with the sourced 14.54%/21-max/30s/1-per-second shape', () => {
    const b = CANTARELLA_BLOCKS.find(x => x.id === 'cantarella.liberation.diffusion-summons');
    expect(b.trigger).toEqual({
      type: 'windowed-proc',
      opensOnProc: ['cast:Liberation:Beneath the Sea'],
      windowSeconds: 30,
      maxProcs: 21,
      crossCharacterHit: true,
      minProcInterval: 1,
    });
    expect(b.damage.hits.reduce((s, h) => s + h.atkPct, 0)).toBeCloseTo(14.54, 2);
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): kit text is explicit —
    // "summons Dreamweavers for Coordinated Attacks (Havoc DMG, considered Basic Attack DMG)" —
    // was wrongly coordDmg despite the override.
    expect(b.damage.category).toBe('basicDmg');
  });

  it('Flowing Suffocation is basicDmg, not libDmg — "considered Basic Attack DMG" per kit text (Phase A audit, 2026-09-04)', () => {
    const b = CANTARELLA_BLOCKS.find(x => x.id === 'cantarella.liberation.flowing-suffocation');
    expect(b.damage.category).toBe('basicDmg');
  });

  it('fires from her own solo rotation (own hits qualify too, no move-type filter)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Cantarella'], CANTARELLA_BLOCKS);
    const { hitLog } = resolveHitComposedDps(CANTARELLA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Sub DPS');
    expect(hitLog.some(h => h.blockId === 'cantarella.liberation.diffusion-summons')).toBe(true);
  });

  it("in a real team context, an ALLY's hit (not just Cantarella's own) advances the window and the resulting damage is credited to Cantarella", () => {
    const allyBlocks = [
      { id: 'ally.basic.hit', source: 'Ally', kind: 'damage', trigger: { type: 'cast', on: 'Basic ATK:Hit' }, timing: {}, target: { scope: 'self' }, effects: [], damage: { hits: [{ atkPct: 30 }] } },
    ];
    const steps = [
      { owner: 'Cantarella', type: 'Liberation', skill: 'Beneath the Sea', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 2 },
    ];
    const blocksByOwner = { Cantarella: CANTARELLA_BLOCKS, Ally: allyBlocks };
    const { hitLog } = resolveHitComposedTeamDps(steps, blocksByOwner, 'Cantarella', { enemyDef: 800, enemyRes: 10 }, { atk: 1000 }, { targetElementLower: 'havoc', targetRole: 'Sub DPS' });
    const procHits = hitLog.filter(h => h.blockId === 'cantarella.liberation.diffusion-summons');
    // Cantarella's own Liberation cast (t=1) qualifies too, then Ally's hit at t=3 (2s later, past
    // minProcInterval:1) procs again.
    expect(procHits.map(h => h.time)).toEqual([1, 3]);
  });
});
