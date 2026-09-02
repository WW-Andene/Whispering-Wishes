// Regression test found via a precise audit of one real base team (Jinhsi + Zhezhi)'s 3rd-slot
// recommendations. Phoebe topped the list at 486.2, ahead of Jinhsi's own curated real partner
// Shorekeeper (314.5, the exact 'Jinhsi + Zhezhi + Shorekeeper' trio in CHARACTER_DATA['Jinhsi'].teams).
//
// Root cause: Phoebe's Confession-mode outro grants `deepen +100% "Spectro Frazzle DMG Amp
// (Confession)"` — this only amplifies FRAZZLE-type damage, not a Spectro DPS's general output.
// Phoebe's own `desc` says outright she's "built specifically to empower Zani, her only current
// Frazzle-DPS partner" (Zani's own `desc`: her Heavy Slash combo is "flagged as both Heavy Attack and
// Spectro Frazzle DMG" — her own hits are computed under the Frazzle category). Jinhsi doesn't deal or
// scale off Frazzle damage at all. But universalStatApplies (shared by scoreTeamComposition AND the
// real damage calculator, calcTeamStats.js, via applyBuff) only checked for a MISMATCHED ELEMENT in
// the condition text — "Spectro Frazzle DMG Amp" contains "spectro" (Jinhsi's own element), so it
// passed and credited full uplift to a DPS the buff mechanically does nothing for.
//
// Fixed by adding a small, explicit, data-driven MECHANIC_DAMAGE_APPLIERS allow-list: a deepen/
// offTune/allDmg condition naming a specific damage mechanic (currently 'frazzle') only applies to
// characters confirmed (via their own `desc`) to deal that mechanic's damage as their own attack type
// — just Zani today. Ciaccona's identical-shaped "Aero Erosion DMG Amp only" outro is covered by the
// same mechanism with an empty erosion allow-list (no character's own damage is currently documented
// as Erosion-flagged), so it now correctly credits nobody until one is confirmed, rather than
// crediting every Aero DPS.
import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE } from '../data/characters.js';
import { scoreTeamComposition, universalStatApplies } from '../features/teams/calcEngine.js';

describe('universalStatApplies — mechanic-locked deepen buffs require a confirmed applier', () => {
  it("rejects Phoebe's Frazzle-locked condition for a non-Frazzle-dealing character (even same element)", () => {
    const cond = 'Spectro Frazzle DMG Amp (Confession)';
    expect(universalStatApplies(cond, 'spectro', 'Jinhsi')).toBe(false);
  });

  it("accepts Phoebe's Frazzle-locked condition for Zani (her documented Frazzle-DPS partner)", () => {
    const cond = 'Spectro Frazzle DMG Amp (Confession)';
    expect(universalStatApplies(cond, 'spectro', 'Zani')).toBe(true);
  });

  it("rejects Ciaccona's Erosion-locked condition for any current character (no confirmed Erosion applier yet)", () => {
    const cond = 'Aero Erosion DMG Amp only';
    expect(universalStatApplies(cond, 'aero', 'Ciaccona')).toBe(false);
    expect(universalStatApplies(cond, 'aero', 'Jiyan')).toBe(false);
  });

  it('a plain element-locked condition with no mechanic name is unaffected', () => {
    expect(universalStatApplies('Tune Strain mode', 'fusion', 'AnyCharacter')).toBe(true);
  });
});

describe('scoreTeamComposition — Phoebe no longer outranks Jinhsi\'s own curated real partner', () => {
  it("Phoebe's Frazzle deepen scores far lower for Jinhsi (no Frazzle synergy) than Shorekeeper", () => {
    const phoebe = scoreTeamComposition(['Jinhsi', 'Zhezhi', 'Phoebe'], undefined, 'Jinhsi').score;
    const shorekeeper = scoreTeamComposition(['Jinhsi', 'Zhezhi', 'Shorekeeper'], undefined, 'Jinhsi').score;
    expect(phoebe).toBeLessThan(shorekeeper);
  });

  it('Phoebe still scores her full Frazzle-amp value for Zani, her real Frazzle-DPS partner', () => {
    const withDeepen = scoreTeamComposition(['Zani', 'Zhezhi', 'Phoebe'], undefined, 'Zani').score;
    const saved = CHAR_BUFF_TABLE['Phoebe'].outroBuffs;
    CHAR_BUFF_TABLE['Phoebe'].outroBuffs = saved.filter(b => b.stat !== 'deepen');
    const withoutDeepen = scoreTeamComposition(['Zani', 'Zhezhi', 'Phoebe'], undefined, 'Zani').score;
    CHAR_BUFF_TABLE['Phoebe'].outroBuffs = saved;
    expect(withDeepen).toBeGreaterThan(withoutDeepen);
  });
});
