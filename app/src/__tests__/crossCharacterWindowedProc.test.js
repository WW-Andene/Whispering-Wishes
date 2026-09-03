/**
 * REMAINING_WORK.md 1a — Cantarella's Diffusion off-field summon chain. Proves the new
 * `crossCharacterHit`/`minProcInterval` windowed-proc mechanism itself (hand-built synthetic blocks,
 * not real character data — the real Cantarella application is exercised separately in
 * triggerEngine-cantarella.test.js). Every prior windowed-proc block (Yinlin's S6 Furious Thunder)
 * only ever advanced off the block OWNER's own qualifying hits; this is the cross-character variant
 * where ANY team member's landed hit can advance a window opened by someone else's cast.
 */
import { describe, it, expect } from 'vitest';
import { simulateTeamRotation } from '../engine/rotationSimulator.js';
import { resolveHitComposedTeamDps } from '../engine/resolveHitComposedTeamDps.js';

// Summoner: opens a 10s/3-max proc window on cast, no move-type filter (crossCharacterHit, on omitted).
const SUMMONER_BLOCKS = [
  {
    id: 'summoner.liberation.open-window',
    source: 'Summoner', kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Open' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }] },
  },
  {
    id: 'summoner.proc.summon',
    source: 'Summoner', kind: 'damage',
    trigger: { type: 'windowed-proc', opensOnProc: ['cast:Liberation:Open'], windowSeconds: 10, maxProcs: 3, crossCharacterHit: true, minProcInterval: 1 },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 20 }] },
  },
];
const ALLY_BLOCKS = [
  { id: 'ally.basic.hit', source: 'Ally', kind: 'damage', trigger: { type: 'cast', on: 'Basic ATK:Hit' }, timing: {}, target: { scope: 'self' }, effects: [], damage: { hits: [{ atkPct: 30 }] } },
];

describe('crossCharacterHit windowed-proc (Cantarella Diffusion mechanism)', () => {
  it("advances off an ALLY's hit, not just the block owner's own — the exact gap the plain mechanism had", () => {
    const steps = [
      { owner: 'Summoner', type: 'Liberation', skill: 'Open', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 2 },
    ];
    const results = simulateTeamRotation(steps, { Summoner: SUMMONER_BLOCKS, Ally: ALLY_BLOCKS });
    const allyResult = results.find(r => r.owner === 'Ally');
    expect(allyResult.firedTriggers.has('windowed-proc:cast:Liberation:Open')).toBe(true);
  });

  it("the resulting damage is credited to Summoner (the block owner) even when ALLY's hit is what triggered it", () => {
    const steps = [
      { owner: 'Summoner', type: 'Liberation', skill: 'Open', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 2 },
    ];
    const blocksByOwner = { Summoner: SUMMONER_BLOCKS, Ally: ALLY_BLOCKS };
    const { hitLog } = resolveHitComposedTeamDps(steps, blocksByOwner, 'Summoner', { enemyDef: 800, enemyRes: 10 }, { atk: 1000 });
    const procHits = hitLog.filter(h => h.blockId === 'summoner.proc.summon');
    // Summoner's own opening Liberation cast (t=1) is itself a qualifying "hit landed" (no move-type
    // filter), so it procs immediately too — then Ally's hit at t=3 procs a 2nd time (2s later, past
    // minProcInterval:1). Both are real, both credited to Summoner regardless of who triggered them.
    expect(procHits.map(h => h.time)).toEqual([1, 3]);
  });

  it('does NOT proc for a hit before the window opens', () => {
    const steps = [
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 1 }, // before Summoner ever casts
      { owner: 'Summoner', type: 'Liberation', skill: 'Open', stepSeconds: 1 },
    ];
    const results = simulateTeamRotation(steps, { Summoner: SUMMONER_BLOCKS, Ally: ALLY_BLOCKS });
    expect(results[0].firedTriggers.has('windowed-proc:cast:Liberation:Open')).toBe(false);
  });

  it('respects minProcInterval — two allies hitting within the same second only procs once', () => {
    const steps = [
      { owner: 'Summoner', type: 'Liberation', skill: 'Open', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 0.5 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 0.5 }, // 0.5s after the first, inside minProcInterval:1
    ];
    const results = simulateTeamRotation(steps, { Summoner: SUMMONER_BLOCKS, Ally: ALLY_BLOCKS });
    const allyHits = results.filter(r => r.owner === 'Ally');
    const procCount = allyHits.filter(r => r.firedTriggers.has('windowed-proc:cast:Liberation:Open')).length;
    expect(procCount).toBe(1);
  });

  it('respects maxProcs — caps at 3 even with many qualifying hits, one per second apart', () => {
    const steps = [
      { owner: 'Summoner', type: 'Liberation', skill: 'Open', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Hit', stepSeconds: 1 },
    ];
    const results = simulateTeamRotation(steps, { Summoner: SUMMONER_BLOCKS, Ally: ALLY_BLOCKS });
    const procCount = results.filter(r => r.firedTriggers.has('windowed-proc:cast:Liberation:Open')).length;
    expect(procCount).toBe(3);
  });
});
