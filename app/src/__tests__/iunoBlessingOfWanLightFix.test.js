// Regression test found via a recommendation audit prompted directly by the user, who supplied real
// community write-up text for Augusta's recommended teammates: "Iuno is the best by far due to her
// high personal damage and giving a whopping 90% DMG Amplification effect to Augusta in total." Our
// scorer had Iuno ranked #5 for Augusta — BELOW Rebecca, Mortefi, Lynae, and Shorekeeper — the exact
// opposite of "best by far".
//
// Traced to two real data bugs in Iuno's kit (CHAR_BUFF_TABLE + the live TriggerBlock engine file),
// verified against two independent live sources (wuthering.gg, and a web search aggregating the source/
// the source/sportskeeda) before touching anything:
//
// 1. Her outro's duration was 10s; both sources quote "The incoming Resonator gains 50% Heavy Attack
//    DMG Amplification for 14s" — no source found for 10s. (An earlier 2026-08-31 audit had actually
//    changed 14s to 10s, believing 14s had "no source basis" — that correction was itself wrong.)
// 2. "Blessing of the Wan Light" (+4%/stack all DMG Amp, max 10 stacks = 40%) was modeled as
//    `target: 'self'`, so it never reached any teammate — but both sources describe it as benefiting
//    "the receiving Resonator"/"whichever Resonator receives the shield" inside the Full Moon Domain,
//    not Iuno exclusively. 50% (outro) + 40% (Blessing, base kit) = 90%, matching the community figure
//    exactly. (The chain.s2-gated ADDITIONAL 40% was already correctly modeled as whole-team — only
//    the BASE-kit 40% had this bug.)
import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE } from '../data/characters.js';
import { scoreTeamComposition } from '../features/teams/calcEngine.js';
import { IUNO_BLOCKS } from '../engine/characterBlocks/iuno.blocks.js';

describe("Iuno's Blessing of the Wan Light reaches the teammate she's buffing (base kit, not chain-gated)", () => {
  it('CHAR_BUFF_TABLE: outro is 14s, Blessing targets team not self', () => {
    expect(CHAR_BUFF_TABLE['Iuno'].outroBuffs[0].duration).toBe(14);
    const blessing = CHAR_BUFF_TABLE['Iuno'].selfBuffs.find(b => b.condition.includes('Blessing of the Wan Light'));
    expect(blessing.target).toBe('team');
  });

  it('live engine: outro block is 14s, Blessing block targets whole-team not self', () => {
    const outro = IUNO_BLOCKS.find(b => b.id === 'iuno.outro.gloom-to-gleam-buff');
    expect(outro.timing.duration).toBe(14);
    const blessing = IUNO_BLOCKS.find(b => b.id === 'iuno.selfbuff.blessing-of-the-wan-light');
    expect(blessing.target.scope).toBe('whole-team');
  });

  it("Iuno now ranks #1 for Augusta, matching the community's \"best by far\" — above Mortefi, Lynae, Rebecca, Shorekeeper", () => {
    const CURATED_VOTE_BONUS = 20;
    const iuno = scoreTeamComposition(['Augusta', 'Iuno']).score + CURATED_VOTE_BONUS; // curated (Augusta+Iuno+Shorekeeper)
    const mortefi = scoreTeamComposition(['Augusta', 'Mortefi']).score + CURATED_VOTE_BONUS;
    const lynae = scoreTeamComposition(['Augusta', 'Lynae']).score;
    const rebecca = scoreTeamComposition(['Augusta', 'Rebecca']).score;
    const shorekeeper = scoreTeamComposition(['Augusta', 'Shorekeeper']).score + CURATED_VOTE_BONUS;

    expect(iuno).toBeGreaterThan(mortefi);
    expect(iuno).toBeGreaterThan(lynae);
    expect(iuno).toBeGreaterThan(rebecca);
    expect(iuno).toBeGreaterThan(shorekeeper);
  });
});
