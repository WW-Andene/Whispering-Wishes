// Regression test for a bug found during a real, per-character (58/58) deep audit of the solo
// teammate-recommendation feature (2026-09-01), following up on two earlier fixes in the same area.
// scoreTeamComposition's debuffs loop credited resShred (RES Shred) uplift completely UNGATED by
// element — unlike elemDmg buffs (which correctly check the buff's own condition text via
// elemBuffApplies), even though RES Shred reduces enemy resistance to a SPECIFIC element, same as an
// elemDmg buff. Lupa's own debuff condition literally says "Fusion RES ignore, Glory..." — Fusion-
// locked — yet it was crediting full uplift for a placed Havoc/Aero/Electro/Glacio carry who can
// never trigger a Fusion-locked RES Shred. This alone was enough to crown Lupa the #1 solo
// recommendation for Chisa (Havoc), Ciaccona (Aero), Lumi (Electro), and Rover: Havoc, none of whom
// have any real Fusion-element synergy with her.
//
// Fixed by gating resShred through elemBuffApplies (the same check elemDmg buffs already use) —
// DEF Shred (defShred) stays ungated, correctly: DEF is a flat, element-agnostic stat every damage
// type is reduced by equally, unlike RES which is tracked per-element.
import { describe, it, expect } from 'vitest';
import { scoreTeamComposition } from '../features/teams/calcEngine.js';

describe('scoreTeamComposition — RES Shred debuffs gated by the placed DPS\'s element (Shred bug fix)', () => {
  it('Lupa (Fusion-locked RES Shred) no longer outranks a real same-element candidate for an off-element (Havoc) carry', () => {
    // dpsOverride='Chisa' mirrors TeamsTab.jsx's fixed assumedMainDps pipeline (Chisa, role:'Support/
    // Healer', would otherwise not be recognized as the team's carry at all).
    const scored = ['Lynae', 'Lupa', 'Roccia'].map(name => ({ name, score: scoreTeamComposition(['Chisa', name], undefined, 'Chisa').score }));
    const lupa = scored.find(s => s.name === 'Lupa').score;
    const bestOther = Math.max(...scored.filter(s => s.name !== 'Lupa').map(s => s.score));
    expect(lupa).toBeLessThan(bestOther);
  });

  it("Lupa's RES Shred still fully applies for an actual Fusion carry (no regression for the legitimate case)", () => {
    // Brant is Fusion — Lupa's "Fusion RES ignore" debuff genuinely helps here, so her score with a
    // real Fusion placed member should be noticeably higher than with an off-element one (Chisa,
    // Havoc) — proving the gate is discriminating by element, not just suppressing Lupa everywhere.
    const withFusion = scoreTeamComposition(['Brant', 'Lupa'], undefined, 'Brant').score;
    const withOffElement = scoreTeamComposition(['Chisa', 'Lupa'], undefined, 'Chisa').score;
    expect(withFusion).toBeGreaterThan(withOffElement);
  });
});
