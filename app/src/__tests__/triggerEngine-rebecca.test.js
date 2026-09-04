import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, SKILL_MULTIPLIERS, CHARACTER_DATA, getSkillIcon } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/composition/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/composition/rotationSimulator.js';
import { REBECCA_BLOCKS } from '../engine/characterBlocks/rebecca.blocks.js';

describe('triggerEngine parity — Rebecca', () => {
  // Fixed 2026-09-02 against a fresh the source dump: 3 blocks were miscategorized (the reverse of the
  // usual pattern — wrongly tagged heavyDmg/libDmg when the kit text explicitly overrides them to
  // Basic Attack DMG). Rat-tat-tat!/Bang-bang-bang! and the Mk. 31 HMG channel both say "considered
  // Basic Attack DMG" outright; BOOM! Fireworks! has no explicit override text but the dump's own
  // damage-profile shows a literal 0 in the Liberation bucket, confirming the source counts the whole
  // Liberation sequence as Basic Attack DMG too.
  it('Rat-tat-tat!, Party \'til Dawn!, and BOOM! Fireworks! are all basicDmg, not heavyDmg/libDmg', () => {
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.forte.rat-tat-tat-huntress').damage.category).toBe('basicDmg');
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.liberation.party-til-dawn').damage.category).toBe('basicDmg');
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.liberation.boom-fireworks').damage.category).toBe('basicDmg');
  });

  // Value locked in 2026-09-02: the source .mht snapshot's raw Lv.10 table showed
  // 19.89%×3+318.10%+19.89%, conflicting with the user's own directly-pasted the source text
  // (10.00%×3+160.00%+10.00%). Per standing instruction, user-pasted the source text wins a real
  // conflict — the user also independently re-checked and confirmed the source number.
  it("Rat-tat-tat! uses the source-sourced value (10/10/10/160/10), not the source one", () => {
    const block = REBECCA_BLOCKS.find(b => b.id === 'rebecca.forte.rat-tat-tat-huntress');
    const total = block.damage.hits.reduce((sum, h) => sum + h.atkPct, 0);
    expect(total).toBeCloseTo(200, 1); // 10+10+10+160+10
  });

  it('S4 stays correctly unmodeled (no block) — buff-to-a-buff, no flat-schema equivalent per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Rebecca'];
    expect(rc.s4).toEqual({});
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s4')).toBeUndefined();
  });

  it('S1/S2/S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Rebecca'];
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s1').effects[0].value).toBe(rc.s1.basicDmg);
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s2').effects[0].value).toBe(rc.s2.allDmg);
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s5').effects[0].value).toBe(rc.s5.basicDmg);
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s6').effects[0].value).toBe(rc.s6.basicDmg);
  });

  it('S6 additionally has a real 900%-ATK bonus-hit proc block beyond the flat basicDmg multiplier', () => {
    const bonus = REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s6-bonus-hit');
    expect(bonus.kind).toBe('damage');
    expect(bonus.damage.hits[0].atkPct).toBe(900);
  });

  it('S2 is team-wide, matching RESONANCE_CHAIN_DATA', () => {
    const s2 = REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s2');
    expect(s2.target.scope).toBe('whole-team');
  });

  it('outro and selfBuffs match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Rebecca'];
    const outro = REBECCA_BLOCKS.find(b => b.id === 'rebecca.outro.preem-choom');
    expect(outro.effects.find(e => e.stat === 'heavyDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'allDmg').value).toBe(legacy.outroBuffs[1].value);
    const huntress = REBECCA_BLOCKS.find(b => b.id === 'rebecca.selfbuff.huntress');
    const guts = REBECCA_BLOCKS.find(b => b.id === 'rebecca.selfbuff.guts');
    expect(huntress.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(guts.effects[0].value).toBe(legacy.selfBuffs[1].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rebecca'], REBECCA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(REBECCA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'electro', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has("rebecca.intro.yo-its-big-boomin-time")).toBe(true);
    expect(fired.has('rebecca.forte.rat-tat-tat-huntress')).toBe(true);
    expect(fired.has('rebecca.liberation.boom-fireworks')).toBe(true);
    expect(fired.has('rebecca.chain.s6-bonus-hit')).toBe(true);
  });

  // Fixed 2026-09-04 (fresh Phase A 9-dimension audit): SKILL_MULTIPLIERS['Rebecca']'s Hack Response -
  // Meltdown row was stuck at the stale 2358.89% .mht-snapshot value, while CHAR_BUFF_TABLE['Rebecca']
  // .tuneBreak.ruptureDmgMult had already been corrected to 1186.5 on 2026-09-02 per the user-pasted
  // source text (matching this fresh dump's own "Hack Response-Meltdown: 1186.50% Tune AMP" exactly) —
  // a two-path desync (same bug class as Lumi's raw-table-vs-trigger-engine desync) that left the
  // informational SKILL_MULTIPLIERS display row showing a number roughly double the real one actually
  // used by the legacy Tune Break aggregate calc.
  it('Hack Response - Meltdown SKILL_MULTIPLIERS row matches CHAR_BUFF_TABLE.tuneBreak.ruptureDmgMult (no two-path desync)', () => {
    const row = SKILL_MULTIPLIERS['Rebecca'].find(r => r[1] === 'Hack Response - Meltdown');
    expect(row[2]).toContain('1186.50%');
    expect(CHAR_BUFF_TABLE['Rebecca'].tuneBreak.ruptureDmgMult).toBe(1186.5);
  });

  // Fixed 2026-09-04: CHARACTER_DATA['Rebecca'].bestEchoes held the dump's "Special Echo Set option"
  // (Shadow of Shattered Dreams + Adam Smasher, a personal-damage alternative that explicitly
  // "sacrifices team buffing") instead of her actual dump-scored **Best Echo Set** — Moonlit Clouds at
  // 100.00%, this file's own convention being [Main Echo, 'Set 5pc'] (see e.g. Encore's
  // ['Impermanence Heron', 'Moonlit Clouds 5pc']).
  it('bestEchoes reflects the dump-scored Best Echo Set (Moonlit Clouds), not the special alternative', () => {
    expect(CHARACTER_DATA['Rebecca'].bestEchoes).toEqual(['Bell-Borne Geochelone', 'Moonlit Clouds 5pc']);
  });

  // Fixed 2026-09-04: SKILL_ICONS['Rebecca'] had no key matching SKILL_MULTIPLIERS' own 'Huntress Stage
  // 1-3' Basic ATK row name, or either 'Standard - Huntress'/'Standard - Guts' Heavy ATK row name —
  // getSkillIcon's skillName.includes(key) lookup silently returned null for all three, a real no-icon
  // gap in the SKILL_MULTIPLIERS-listing view.
  it('getSkillIcon resolves every SKILL_MULTIPLIERS row name to a real icon (no silent no-icon gap)', () => {
    for (const [, skillName] of SKILL_MULTIPLIERS['Rebecca']) {
      expect(getSkillIcon('Rebecca', skillName)).toBeTruthy();
    }
  });
});
