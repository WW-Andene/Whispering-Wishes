import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CIACCONA_BLOCKS } from '../engine/characterBlocks/ciaccona.blocks.js';

describe('triggerEngine parity — Ciaccona', () => {
  // Fixed 2026-09-02: category was previously unset. WuWa's own general mechanic (Mid-air/Plunging
  // Attacks inherit Basic ATK or Heavy ATK DMG, never their own type) plus the dump's own kit structure
  // (listed under "Basic Attack — Quadruple Time Steps") confirms basicDmg.
  it('Mid-air Attack is basicDmg-categorized', () => {
    const block = CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.midair.attack-stage1-2');
    expect(block.damage.category).toBe('basicDmg');
  });

  it('S3 stays correctly unmodeled (no block) — pure resource-grant per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Ciaccona'];
    expect(rc.s3).toEqual({});
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s3')).toBeUndefined();
  });

  // Fixed 2026-09-02 (fresh the source dump): S6 is correctly zeroed to {} in RESONANCE_CHAIN_DATA (its
  // real shape, a flat 220% ATK proc, doesn't fit that flat {stat:value} table) but that had left it
  // entirely unbuilt — added as its own gated `kind:'damage'` block instead.
  it('S6 is a real, sequence-6-gated damage block (not a RESONANCE_CHAIN_DATA stat)', () => {
    const rc = RESONANCE_CHAIN_DATA['Ciaccona'];
    expect(rc.s6).toEqual({});
    const s6 = CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s6');
    expect(s6.kind).toBe('damage');
    expect(s6.damage.category).toBe('libDmg');
    expect(s6.damage.hits.reduce((sum, h) => sum + h.atkPct, 0)).toBeCloseTo(220, 1);
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Ciaccona'], CIACCONA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const atS6 = resolveHitComposedDps(CIACCONA_BLOCKS, steps, ctx, 3500, 'aero', 'Sub DPS', null, 6);
    const atS5 = resolveHitComposedDps(CIACCONA_BLOCKS, steps, ctx, 3500, 'aero', 'Sub DPS', null, 5);
    expect(atS6.hitLog.some(h => h.blockId === 'ciaccona.chain.s6')).toBe(true);
    expect(atS5.hitLog.some(h => h.blockId === 'ciaccona.chain.s6')).toBe(false);
  });

  it('S1/S2/S4/S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Ciaccona'];
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s1').effects[0].value).toBe(rc.s1.atkPct);
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s2').effects[0].value).toBe(rc.s2.elemDmg);
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s4').effects[0].value).toBe(rc.s4.defIgnore);
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
  });

  it('outro and libBuff match CHAR_BUFF_TABLE, with the outro correctly scoped to Aero only', () => {
    const legacy = CHAR_BUFF_TABLE['Ciaccona'];
    const outro = CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.outro.windcalling-tune');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    expect(outro.condition.element).toBe('aero');
    const lib = CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.libbuff.solo-concert');
    expect(lib.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(lib.effects[0].stat).toBe('elemDmg');
    expect(lib.target.scope).toBe('whole-team');
  });

  // Fixed 2026-09-02: Quadruple Downbeat had NO damage.category at all (found while checking the team
  // engine's routing), meaning any teammate's Heavy ATK DMG Bonus was silently worth zero on her real
  // Heavy Attack replacement — the same false-negative class as an unset totalMult accumulator.
  it('Quadruple Downbeat is heavyDmg-categorized and actually receives heavyDmg bonuses', () => {
    const block = CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.forte.quadruple-downbeat');
    expect(block.damage.category).toBe('heavyDmg');
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Ciaccona'], CIACCONA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withoutBonus = resolveHitComposedDps(CIACCONA_BLOCKS, steps, ctx, 3500, 'aero', 'Sub DPS');
    const withBonus = resolveHitComposedDps(CIACCONA_BLOCKS, steps, ctx, 3500, 'aero', 'Sub DPS', { heavyDmg: 50 });
    const hitWithout = withoutBonus.hitLog.find(h => h.blockId === 'ciaccona.forte.quadruple-downbeat');
    const hitWith = withBonus.hitLog.find(h => h.blockId === 'ciaccona.forte.quadruple-downbeat');
    expect(hitWith.damage).toBeGreaterThan(hitWithout.damage);
  });

  // Fixed 2026-09-02: dmgFocus was missing 'Heavy ATK' and 'Liberation' — her 2nd- and 1st-largest real
  // damage categories per the dump's own profile — meaning routeTypeBonuses() silently zeroed any
  // teammate's Heavy ATK/Liberation DMG Bonus for her in the real team-composition engine.
  it('dmgFocus includes Heavy ATK and Liberation, her largest real damage categories', async () => {
    const { CHARACTER_DATA } = await import('../data/characters.js');
    const focus = CHARACTER_DATA['Ciaccona'].dmgFocus;
    expect(focus).toContain('Heavy ATK');
    expect(focus).toContain('Liberation');
    expect(focus).toContain('Basic ATK');
    expect(focus).toContain('Skill');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Ciaccona'], CIACCONA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CIACCONA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'aero', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('ciaccona.intro.roaming-with-the-wind')).toBe(true);
    // Fixed 2026-09-02: the dump's own row label ("Skill Damage", not "Roaming with the Wind DMG")
    // confirms this is plain Resonance Skill DMG — was previously left uncategorized on a first pass.
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.intro.roaming-with-the-wind').damage.category).toBe('skillDmg');
    expect(fired.has('ciaccona.forte.quadruple-downbeat')).toBe(true);
    expect(fired.has("ciaccona.liberation.singers-triple-cadenza")).toBe(true);
  });

  // Phase A audit 2026-09-04: bestEchoes main-slot echo was 'Reminiscence: Fleurdelys' — the dump's own
  // Best Echo Sets section explicitly names Nightmare: Kelpie as the best main-slot pick (small margin
  // over Fleurdelys, which is only better when running Lux & Umbra — not her stored bestWeapon).
  it('bestEchoes main slot is Nightmare: Kelpie, matching the dump\'s explicit best-pick call', () => {
    const d = CHARACTER_DATA['Ciaccona'];
    expect(d.bestEchoes[0]).toBe('Nightmare: Kelpie');
  });

  // Phase A audit 2026-09-04: weaponAlts.alt4 included 'Solar Flame', a real 4★ Pistols weapon not named
  // anywhere in Ciaccona's own dump (the dump names exactly one 4★, Romance in Farewell) — stale/
  // fabricated entry, removed.
  it('weaponAlts.alt4 does not include the unsourced Solar Flame entry', () => {
    const d = CHARACTER_DATA['Ciaccona'];
    expect(d.weaponAlts.alt4).not.toContain('Solar Flame');
    expect(d.weaponAlts.alt4).toEqual(['Romance in Farewell']);
  });

  // Phase A audit 2026-09-04: stored tier was {toa:'T0', ww:'T1'} — the dump's own Review section lists
  // "T0.5 (ToA, standard) / T1 (WW, standard)", not T0/T1 (that pairing belongs to the dump's Value Tier
  // List instead, T1.5/T1.5, not the standard list this table otherwise follows).
  it('tier matches the dump\'s standard (non-Value-list) Review rating: T0.5 ToA / T1 WW', () => {
    const d = CHARACTER_DATA['Ciaccona'];
    expect(d.tier).toEqual({ toa: 'T0.5', ww: 'T1' });
  });
});
