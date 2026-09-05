/**
 * Engine-readiness pass (2026-09-05): three real capability gaps found while auditing Aalto as the
 * blueprint character — no character currently NEEDS these (Aalto doesn't), but Baizhi (Max HP%
 * buff), Cartethyia/Encore (HP-threshold conditions), and any future healer (kind:'heal') will hit
 * them immediately. Tested here against synthetic blocks, not a real character file — same
 * precedent as how block.schema.js's own primitives were proven before any character adopted them.
 */
import { describe, it, expect } from 'vitest';
import { createStats, applyBuff } from '../features/teams/calcEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { resolveHealComposed } from '../engine/resolver/dps/resolveHealComposed.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';
import { parseHealHits } from '../engine/math/hitParser.js';
import { conditionHolds } from '../engine/resolver/gating/triggerEngine.js';

describe('hpPct/defPct/healBonusPct — real stat cases, not silently dropped', () => {
  it('applyBuff accumulates hpPct/defPct/healBonusPct', () => {
    const stats = createStats();
    applyBuff(stats, 'hpPct', 12, {});
    applyBuff(stats, 'defPct', 8, {});
    applyBuff(stats, 'healBonusPct', 20, {});
    expect(stats.hpPct).toBe(12);
    expect(stats.defPct).toBe(8);
    expect(stats.healBonusPct).toBe(20);
  });

  it('resolveHitComposedDps scales an HP-basis damage block by hpPct (previously always 0 credit)', () => {
    const SOURCE = 'Synthetic';
    const blocks = [
      { id: 'synth.buff.hp-boost', source: SOURCE, kind: 'buff', section: 'Buff', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'hpPct', value: 50, source: 'self-kit' }] },
      { id: 'synth.skill.hp-nuke', source: SOURCE, kind: 'damage', section: 'Skill', trigger: { type: 'cast', on: 'Skill:HP Nuke' }, timing: {}, target: { scope: 'self' }, effects: [], damage: { hits: [{ atkPct: 10 }], basis: 'HP' } },
    ];
    expectValidBlockFile(blocks, SOURCE);
    const steps = [{ type: 'Skill', skill: 'HP Nuke', stepSeconds: 1 }];
    const { hitLog } = resolveHitComposedDps(blocks, steps, { enemyDef: 0, enemyRes: 0 }, { hp: 10000 }, null, null);
    // hpPct+50 -> effBase = 10000 * 1.5 = 15000; hit is 10% of that = 1500, ×avgCrit from the
    // always-present BASE_CRIT_RATE(5%)/BASE_CRIT_DMG(150%) baseline (1500 * 1.025 = 1537.5) — no
    // other modifiers set up in this synthetic case.
    expect(hitLog[0].damage).toBeCloseTo(1537.5, 1);
  });
});

describe("kind:'heal' — real resolution, not inert", () => {
  const SOURCE = 'Synthetic';
  const blocks = [
    { id: 'synth.buff.heal-bonus', source: SOURCE, kind: 'buff', section: 'Buff', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'healBonusPct', value: 20, source: 'self-kit' }] },
    {
      id: 'synth.skill.mend',
      source: SOURCE, kind: 'heal', section: 'Skill',
      trigger: { type: 'cast', on: 'Skill:Mend' },
      timing: {}, target: { scope: 'self' }, effects: [],
      heal: { hits: parseHealHits('10%×2'), basis: 'HP' },
    },
  ];

  it('every block matches the canonical schema (heal.basis/heal.hits enforced)', () => {
    expectValidBlockFile(blocks, SOURCE);
  });

  it('rejects a heal block missing heal.basis', () => {
    const bad = [{ id: 'synth.skill.bad-heal', source: SOURCE, kind: 'heal', section: 'Skill', trigger: { type: 'cast', on: 'Skill:Bad' }, timing: {}, target: { scope: 'self' }, effects: [], heal: { hits: [{ pct: 10 }] } }];
    expect(() => expectValidBlockFile(bad, SOURCE)).toThrow(/heal\.basis/);
  });

  it('resolveHealComposed computes a real, non-zero heal total scaled by healBonusPct', () => {
    const steps = [{ type: 'Skill', skill: 'Mend', stepSeconds: 1 }];
    const { totalHealing, healLog } = resolveHealComposed(blocks, steps, { hp: 10000 });
    // 10%×2 of 10000 HP = 1000 + 1000 = 2000 base, ×1.20 healBonusPct = 2400.
    expect(totalHealing).toBeCloseTo(2400, 0);
    expect(healLog[0].blockId).toBe('synth.skill.mend');
  });

  it('a flat-basis heal ignores hpPct/atkPct/defPct scaling entirely', () => {
    const flatBlocks = [
      { id: 'synth.skill.flat-mend', source: SOURCE, kind: 'heal', section: 'Skill', trigger: { type: 'cast', on: 'Skill:FlatMend' }, timing: {}, target: { scope: 'self' }, effects: [], heal: { hits: [{ pct: 0, flat: 500 }], basis: 'flat' } },
    ];
    const steps = [{ type: 'Skill', skill: 'FlatMend', stepSeconds: 1 }];
    const { totalHealing } = resolveHealComposed(flatBlocks, steps, {});
    expect(totalHealing).toBe(500);
  });
});

describe('condition.casterHpPct — HP-threshold gating (Cartethyia/Encore-shaped mechanics)', () => {
  const SOURCE = 'Synthetic';
  const block = { id: 'synth.buff.low-hp-bonus', source: SOURCE, kind: 'buff', section: 'Buff', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, condition: { casterHpPct: { below: 50 } }, effects: [{ stat: 'atkPct', value: 30, source: 'self-kit' }] };

  it('does NOT hold when no HP assumption is supplied (conservative default — opposite of element/role)', () => {
    // resolveSimulatedRotation has no casterHpPctAssumed passthrough yet (no real block uses this
    // condition), so this proves conditionHolds()'s own conservative default directly.
    expect(conditionHolds(block.condition, null, null)).toBe(false);
  });

  it('holds when a supplied assumption satisfies the threshold', () => {
    expect(conditionHolds(block.condition, null, null, 30)).toBe(true);
  });

  it('does not hold when a supplied assumption fails the threshold', () => {
    expect(conditionHolds(block.condition, null, null, 80)).toBe(false);
  });
});
