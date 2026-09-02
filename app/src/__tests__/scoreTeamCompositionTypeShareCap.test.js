// Regression test found via a precise audit of one real base team (Carlotta + Zhezhi)'s 3rd-slot
// recommendations. Taoqi — T4 tier, a single narrow 'next'-only 38% skillDmg outro buff — ranked #2 at
// 452.9, ABOVE Shorekeeper (428.1: Carlotta's own twice-curated real partner, three genuine team-wide
// buffs combined). Isolating each character's buff-only contribution: Taoqi's single buff scored +158.3
// points, Shorekeeper's three combined scored only +64.1 — 2.5x for a narrower, single-target buff
// against three broader, real, curated ones.
//
// Root cause: typeShareMultiplier scaled a type-specific buff (skillDmg/basicDmg/etc.) by
// `share * qualifyingTypeCount` with no ceiling — `share` (how concentrated the DPS's own rotation is
// in that move type) is real, but `qualifyingTypeCount` (however many distinct move-type categories the
// rotation happens to touch at all, including a single trivial Echo cast) has no grounding in real
// damage output and is unbounded as count grows for a fixed share. Carlotta's 77.8% Skill share × 3
// qualifying categories hit a 2.33x multiplier, while every one of Shorekeeper's genuinely universal
// buffs (critRate/critDmg/allDmg — not type-specific, always multiplier 1) stayed capped at neutral.
//
// The first fix tried (pure `share`, dropping the count factor entirely) fixed this case but broke a
// separate, already-validated one: Mortefi (Augusta's own real curated partner) fell behind Rebecca
// (not curated) once his heavyDmg buff was discounted to Augusta's raw 41.7% Heavy ATK share — her
// damage splits across 4 close-ish categories, so pure share over-corrected a buff to her genuinely
// still-largest category. Landed on capping share*count at 1.3 instead — low enough Taoqi's 2.33x can't
// repeat, high enough Mortefi's meaningfully-dominant-type buff still beats Rebecca's discounted one.
import { describe, it, expect } from 'vitest';
import { scoreTeamComposition } from '../features/teams/calcEngine.js';

describe('typeShareMultiplier — capped so a narrow type-specific buff cannot outrank broader universal ones', () => {
  it("Carlotta+Zhezhi: Taoqi (T4, single narrow skillDmg outro) no longer outranks Shorekeeper (Carlotta's curated real partner)", () => {
    const taoqi = scoreTeamComposition(['Carlotta', 'Zhezhi', 'Taoqi'], undefined, 'Carlotta').score;
    const shorekeeper = scoreTeamComposition(['Carlotta', 'Zhezhi', 'Shorekeeper'], undefined, 'Carlotta').score;
    expect(taoqi).toBeLessThan(shorekeeper);
  });

  it("Augusta: Mortefi (real curated partner, Heavy ATK-focused kit) still outranks Rebecca (not curated) once the curated-vote bonus is folded in", () => {
    const CURATED_VOTE_BONUS = 20;
    const rebecca = scoreTeamComposition(['Augusta', 'Rebecca']).score;
    const mortefi = scoreTeamComposition(['Augusta', 'Mortefi']).score + CURATED_VOTE_BONUS;
    expect(mortefi).toBeGreaterThan(rebecca);
  });

  it("Encore+Shorekeeper: Denia (pure universal elemDmg) still correctly below Lupa (elemDmg + type-specific basicDmg)", () => {
    const denia = scoreTeamComposition(['Encore', 'Shorekeeper', 'Denia'], undefined, 'Encore').score;
    const lupa = scoreTeamComposition(['Encore', 'Shorekeeper', 'Lupa'], undefined, 'Encore').score;
    expect(denia).toBeLessThan(lupa);
  });
});
