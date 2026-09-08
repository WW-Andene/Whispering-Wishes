import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { CARTETHYIA_BLOCKS } from '../engine/characterBlocks/cartethyia.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Cartethyia', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(CARTETHYIA_BLOCKS, 'Cartethyia');
  });

  it('S5 stays correctly unmodeled (no block) — purely defensive per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Cartethyia'];
    expect(rc.s5).toEqual({ totalMult: 0 });
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s5')).toBeUndefined();
  });

  it('S1 models the real per-stack mechanic (25 x4 stacks = 100 max)', () => {
    const rc = RESONANCE_CHAIN_DATA['Cartethyia'];
    const s1 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s1');
    expect(s1.effects[0].value).toBe(rc.s1.critDmg);
  });

  it('S2/S3/S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Cartethyia'];
    const s2 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s2');
    expect(s2.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s2.basicDmg);
    expect(s2.effects.find(e => e.stat === 'totalMult').value).toBe(rc.s2.totalMult);
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s6').effects[0].value).toBe(rc.s6.elemDmg);
  });

  it('S6 is correctly a debuff on enemies, not a self buff', () => {
    const s6 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s6');
    expect(s6.kind).toBe('debuff');
    expect(s6.target.scope).toBe('all-enemies');
  });

  it('every damage block scales off HP, not ATK', () => {
    const damageBlocks = CARTETHYIA_BLOCKS.filter(b => b.kind === 'damage');
    expect(damageBlocks.length).toBeGreaterThan(0);
    damageBlocks.forEach(b => expect(b.damage.basis).toBe('HP'));
  });

  it('outro and the Wind\'s Indelible Imprint debuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Cartethyia'];
    const outro = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.outro.winds-divine-blessing');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    const imprint = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.debuff.winds-indelible-imprint');
    expect(imprint.effects[0].value).toBe(legacy.debuffs[1].value);
    expect(imprint.kind).toBe('debuff');
  });

  it('the weapon-specific debuff is NOT modeled (avoids double-counting the weapon\'s own pv)', () => {
    expect(CARTETHYIA_BLOCKS.find(b => b.id.includes('weapon'))).toBeUndefined();
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total using her HP base stat', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Cartethyia'], CARTETHYIA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CARTETHYIA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { hp: 40000 }, 'aero', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has("cartethyia.intro.sword-to-mark-tides-trace")).toBe(true);
    expect(fired.has('cartethyia.liberation.blade-of-howling-squall')).toBe(true);
    expect(fired.has('cartethyia.basic.fleurdelys-1-5')).toBe(true);
  });

  // Found 2026-09-02 against a fresh the source dump: her own Mid-air Attack (Cartethyia Plunging Attack)
  // had NO SKILL_MULTIPLIERS row at all — a silent zero-DMG gap despite being a real step in her
  // modeled rotation (CHARACTER_ROTATIONS's own 'Mid-air:Cartethyia Plunging Attack' step).
  it('Mid-air Attack (Cartethyia Plunging Attack) is a real, non-zero damage block and fires in her rotation', () => {
    const block = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.midair.cartethyia-plunging-attack');
    expect(block).toBeDefined();
    expect(block.damage.hits.length).toBeGreaterThan(0);
    expect(block.damage.hits.reduce((s, h) => s + h.atkPct, 0)).toBeCloseTo(33.87, 1); // 11.29% x 3
    // Fixed 2026-09-02: category was previously unset. WuWa's own general mechanic (Mid-air/Plunging
    // Attacks inherit Basic ATK or Heavy ATK DMG, never their own type) plus the dump's own kit
    // structure (listed under "Basic Attack — Sword to Carve My Forms") confirms basicDmg.
    expect(block.damage.category).toBe('basicDmg');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Cartethyia'], CARTETHYIA_BLOCKS);
    const { hitLog } = resolveHitComposedDps(CARTETHYIA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { hp: 40000 }, 'aero', 'Main DPS');
    expect(hitLog.some(h => h.blockId === 'cartethyia.midair.cartethyia-plunging-attack')).toBe(true);
  });

  // Found 2026-09-02 against the same fresh dump's own damage-profile breakdown (Liberation = 23.6% of
  // her real damage, second only to Basic Attack) — dmgFocus was missing 'Liberation' entirely, meaning
  // any teammate's Liberation DMG Bonus buff was silently dropped for her.
  it("dmgFocus includes 'Liberation' (23.6% of her real damage profile), not just 'Basic ATK'", () => {
    expect(CHARACTER_DATA['Cartethyia'].dmgFocus).toEqual(expect.arrayContaining(['Basic ATK', 'Liberation']));
  });

  it('Mandate of Divinity grants +50% Aero Erosion DMG Amp (amplify, element-scoped) on the Sword Shadow recall', () => {
    const block = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.manifest.mandate-of-divinity');
    expect(block.trigger).toEqual({ type: 'cast', on: 'Mid-air:Cartethyia Plunging Attack' });
    expect(block.condition.element).toBe('aero');
    expect(block.effects[0]).toEqual({ stat: 'amplify', value: 50, source: 'self-kit' });
  });

  // Found 2026-09-03 via a systematic block-coverage audit: her kit text applies real Erosion stacks
  // on Intro/Skill/Basic4, but none of those blocks carried a dotApplier — a complete absence of
  // Erosion-application tracking for this character (dotReactionsFromBlocks.js reads dotApplier, not
  // effects, for shared team-wide DOT reactions).
  it('Intro, Skill, and Basic4 all tag the same flat Erosion dotApplier value (MAX-not-sum aggregation, no double-count risk)', () => {
    const intro = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.intro.sword-to-mark-tides-trace');
    const skill = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.skill.base-form');
    const basic4 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.basic.base-form-1-4');
    for (const b of [intro, skill, basic4]) {
      // requiresTeammate/valueWithTeammate added 2026-09-06 (real Rover: Aero-doubling migration —
      // see dotReactionsFromBlocks.js's resolveErosionFromBlocks and this file's own header note).
      expect(b.dotApplier).toEqual({ mechanic: 'erosion', value: 3, requiresTeammate: 'Rover: Aero', valueWithTeammate: 6 });
    }
  });

  // Found 2026-09-04 (Phase A audit) against a fresh dump: the dump's own "Full rotation" listing
  // explicitly includes "Mid-air Attack Stage 3 (Fleurdelys, hold Basic during Skill)" right after
  // Skill 1 — this real, always-cast step had NO SKILL_MULTIPLIERS row, NO CHARACTER_ROTATIONS step,
  // and NO engine block, a silent zero-DMG gap.
  it('Mid-air Attack Stage 3 (Fleurdelys) is a real, non-zero damage block and fires in her rotation', () => {
    const block = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.midair.fleurdelys-stage-3');
    expect(block).toBeDefined();
    expect(block.damage.hits.reduce((s, h) => s + h.atkPct, 0)).toBeCloseTo(2.20, 2);
    expect(block.damage.category).toBe('basicDmg');
    expect(block.damage.basis).toBe('HP');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Cartethyia'], CARTETHYIA_BLOCKS);
    const { hitLog } = resolveHitComposedDps(CARTETHYIA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { hp: 40000 }, 'aero', 'Main DPS');
    expect(hitLog.some(h => h.blockId === 'cartethyia.midair.fleurdelys-stage-3')).toBe(true);
  });

  // Found 2026-09-04 (Phase A audit): S2's real "+200% Mid-air Attack DMG Multiplier" was previously
  // modeled as a bare unscoped `totalMult`, which resolveHitComposedDps.js applies unconditionally to
  // EVERY hit (totalMult is not category-gated) — silently boosting her whole kit, not just Mid-air
  // Attack. Now scoped via scopedToBlockId to both of her real Mid-air Attack blocks.
  it('S2\'s Mid-air Attack totalMult is scoped to only her 2 real Mid-air Attack blocks, not her whole kit', () => {
    const s2 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s2');
    const midairEffects = s2.effects.filter(e => e.stat === 'totalMult' && e.value === 200);
    expect(midairEffects.length).toBe(2);
    for (const e of midairEffects) {
      expect(e.value).toBe(200);
      expect(e.scopedToBlockId).toBeDefined();
    }
    const scopedIds = midairEffects.map(e => e.scopedToBlockId).sort();
    expect(scopedIds).toEqual([
      'cartethyia.midair.cartethyia-plunging-attack',
      'cartethyia.midair.fleurdelys-stage-3',
    ]);
  });

  // Found 2026-09-08 (full re-audit): S2's kit text groups "Basic ATK/Heavy ATK/Dodge Counter/Intro
  // Skill" under ONE +50% multiplier, but the pre-existing `basicDmg` effect only reaches
  // Basic/Heavy/Dodge-Counter (Intro is category:'introDmg', a category applyBuff() has no case for
  // yet) — Intro's own share of that +50% was silently missing entirely. Delivered via the same
  // scoped-totalMult technique as the Mid-air Attack bonus above.
  it("S2's Intro Skill share of the +50% multiplier is delivered via a scoped totalMult (introDmg stat isn't wired in the engine yet)", () => {
    const s2 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s2');
    const introEffect = s2.effects.find(e => e.stat === 'totalMult' && e.scopedToBlockId === 'cartethyia.intro.sword-to-mark-tides-trace');
    expect(introEffect).toBeDefined();
    expect(introEffect.value).toBe(50);
  });

  // Found 2026-09-08 (full re-audit): both her Intro blocks had no `damage.category` at all — the
  // same class of gap already fixed on Sigrika's/Suisui's own Intro blocks (categories.js registers
  // 'introDmg' for exactly this move type).
  it("both Intro blocks are category:'introDmg'", () => {
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.intro.sword-to-mark-tides-trace').damage.category).toBe('introDmg');
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.intro.sword-to-call-for-freedom').damage.category).toBe('introDmg');
  });

  // Found 2026-09-08 (full re-audit): chain.s1 (Fleurdelys's own Crit DMG) and chain.s6 (targets take
  // +40% more DMG "from Fleurdelys specifically") were both unscoped passives — silently applying to
  // her pre-Manifest, base-Cartethyia-form hits too (Intro/Basic1-4/Skill-base-form/Mid-air Cartethyia
  // Plunging Attack), which fire BEFORE she ever transforms into Fleurdelys and before any Conviction
  // exists. Both are now scoped to only her real Fleurdelys-form damage blocks.
  it('chain.s1 and chain.s6 are scoped to Fleurdelys-form blocks only, excluding her pre-Manifest base-Cartethyia-form hits', () => {
    const fleurdelysBlockIds = [
      'cartethyia.skill.fleurdelys-1',
      'cartethyia.basic.fleurdelys-1-5',
      'cartethyia.skill.fleurdelys-2',
      'cartethyia.midair.fleurdelys-stage-3',
      'cartethyia.liberation.blade-of-howling-squall',
      'cartethyia.heavy.fleurdelys-enhanced',
      'cartethyia.intro.sword-to-call-for-freedom',
      'cartethyia.basic.dodge-counter-fleurdelys',
      'cartethyia.basic.upward-cut-fleurdelys',
    ];
    const s1 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s1');
    const s6 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s6');
    expect(s1.effects[0].scopedToBlockId.sort()).toEqual([...fleurdelysBlockIds].sort());
    expect(s6.effects[0].scopedToBlockId.sort()).toEqual([...fleurdelysBlockIds].sort());
    // Cartethyia-form-only blocks must NOT be in the scope list.
    for (const id of ['cartethyia.intro.sword-to-mark-tides-trace', 'cartethyia.basic.base-form-1-4', 'cartethyia.skill.base-form', 'cartethyia.midair.cartethyia-plunging-attack']) {
      expect(s1.effects[0].scopedToBlockId).not.toContain(id);
      expect(s6.effects[0].scopedToBlockId).not.toContain(id);
    }
  });

  // Positive-verification test for the chain.s1/s6 scoping fix: proves the pre-Manifest Intro hit's
  // real damage is now UNCHANGED by S1/S6's presence (since they no longer reach it), while a real
  // Fleurdelys-form hit still receives S6's +40% elemDmg debuff.
  it("chain.s6's +40% no longer inflates her pre-Manifest Intro hit, but still boosts a real Fleurdelys-form hit", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Cartethyia'], CARTETHYIA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS6 = resolveHitComposedDps(CARTETHYIA_BLOCKS, steps, ctx, { hp: 40000 }, 'aero', 'Main DPS');
    const withoutS6Blocks = CARTETHYIA_BLOCKS.filter(b => b.id !== 'cartethyia.chain.s6');
    const withoutS6 = resolveHitComposedDps(withoutS6Blocks, steps, ctx, { hp: 40000 }, 'aero', 'Main DPS');
    const introWith = withS6.hitLog.find(h => h.blockId === 'cartethyia.intro.sword-to-mark-tides-trace');
    const introWithout = withoutS6.hitLog.find(h => h.blockId === 'cartethyia.intro.sword-to-mark-tides-trace');
    expect(introWith.damage).toBeCloseTo(introWithout.damage, 5);
    const bladeWith = withS6.hitLog.find(h => h.blockId === 'cartethyia.liberation.blade-of-howling-squall');
    const bladeWithout = withoutS6.hitLog.find(h => h.blockId === 'cartethyia.liberation.blade-of-howling-squall');
    expect(bladeWith.damage).toBeGreaterThan(bladeWithout.damage);
  });
});
