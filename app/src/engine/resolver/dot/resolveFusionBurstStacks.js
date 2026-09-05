// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dot/resolveFusionBurstStacks.js
// [RESOLVER · DOT] Real Fusion Burst stack accumulation and detonation count over a team's real
// rotation — replaces the old "explosions = floor(rotTime / 10)" flat guess with a real, sourced
// count, same "steady-state rate over one rotation pass" simplification already used for Tune
// Break's own breaksPerRot fix (see dotFormulas.js's own comment) — real per-owner totals summed,
// not a true cross-character interleaved timeline (that's a bigger, separate architecture project;
// this answers "how many detonations per rotation-length window", not "at which exact instant").
//
// Real, sourced mechanic (2026-09-06, cross-checked against a live fetch of wuthering.gg's own
// Fusion Burst page, corroborating what was ALREADY in Aemeath's/Denia's own primary dumps — see
// each constant's own citation below):
//
// 1. GENERIC passive rule (any team, any character, confirmed via wuthering.gg's own Fusion Burst
//    page): Fusion Burst stacks accumulate on a target; at the default cap (FUSION_BURST_THRESHOLD,
//    10), the game auto-detonates and clears all stacks. Every dotApplier-tagged block's own real
//    `value` (stacks per qualifying hit) feeds this — e.g. Aemeath's own Basic Stage 3/4/Sync
//    Strikes/Intro = 1 stack each (her dump line 83); Denia's Basic combo = 1, her Erosion Field = 2
//    (her dump line 92).
// 2. AEMEATH'S OWN override (her dump line 83, base kit — not sequence-locked): the SAME passive
//    detonation instead fires once real stacks exceed 5 (not 10), still clearing to 0.
// 3. AEMEATH'S OWN Duet cast (her dump line 87, base kit): a SEPARATE forced detonation — fires at
//    "max stack limit" (the real cap, i.e. treated as a full detonation) regardless of the current
//    passive counter, and does NOT clear it (the passive counter keeps accumulating independently).
//    Both her real Duet casts (Encore, Overture) trigger this once each per her own real modeled
//    rotation.
//
// Not modeled (genuinely out of scope, dropped by direct user instruction 2026-09-06): Denia's own
// S6 Erosion-Field-triggered forced detonation (sequence-gated, not base-kit — deferred the same way
// any other sequence-conditional mechanic is until a dedicated pass); the "nearby target defeated"
// trigger (would need a multi-enemy simulator this engine doesn't have — too many parameters for the
// real payoff, dropped per direct instruction).
// ═══════════════════════════════════════════════════════════════════════════════

import { winningStanceForOwner } from '../gating/sequenceGating.js';
import { FUSION_BURST_THRESHOLD } from './dotFormulas.js';

const AEMEATH_EARLY_DETONATION_THRESHOLD = 5; // her dump line 83, "if it has >5 stacks"
const AEMEATH_DUET_BLOCK_IDS = ['aemeath.skill.seraphic-duet-encore', 'aemeath.skill.seraphic-duet-overture'];

/**
 * @param {Object<string, import('../../schema/block.schema.js').TriggerBlock[]>} blocksByOwner
 * @param {Object<string, {type:string, skill?:string}[]>} rotationsByOwner  CHARACTER_ROTATIONS, keyed by owner.
 * @param {Object<string,string>|null} [stanceOverrides]  Manual/forced Resonance Mode per owner (same
 *   shape calcTeamStats.js's own resonanceModeByOwner uses).
 * @returns {{ passiveDetonations: number, forcedDetonations: number, totalDetonations: number, totalStackPoints: number }}
 */
export function resolveFusionBurstDetonations(blocksByOwner, rotationsByOwner, stanceOverrides = null) {
  const allBlocks = Object.values(blocksByOwner).flat();
  const hasAemeath = Object.prototype.hasOwnProperty.call(blocksByOwner, 'Aemeath');

  let totalStackPoints = 0;
  let forcedDetonations = 0;

  Object.entries(blocksByOwner).forEach(([owner, blocks]) => {
    const rotation = rotationsByOwner?.[owner];
    if (!rotation) return;
    const stance = winningStanceForOwner(allBlocks, owner, stanceOverrides?.[owner] ?? null);

    const fusionBlocks = blocks.filter(b => b.dotApplier?.mechanic === 'fusionBurst' && b.dotApplier.value);
    if (fusionBlocks.length) {
      const byLabel = new Map(fusionBlocks.map(b => [b.trigger.on, b]));
      for (const step of rotation) {
        if (!step.type || !step.skill) continue;
        const block = byLabel.get(`${step.type}:${step.skill}`);
        if (!block) continue;
        const req = block.dotApplier.requiresStance;
        if (req != null && req !== stance) continue;
        totalStackPoints += block.dotApplier.value;
      }
    }

    // Aemeath's own Duet-forced detonations — only meaningful in her own Fusion Burst mode (her
    // Duet's Fusion-Burst-mode enhancement, dump line 87), and only for real casts that actually
    // appear in her own modeled rotation. Her Duet blocks are `windowed-cast` triggers (real
    // Seraphic Duo window gating, built earlier this session) — the match label lives in
    // `trigger.attemptOn`, not `trigger.on` (that's only for plain 'cast' blocks).
    if (owner === 'Aemeath' && stance === 'Fusion Burst mode') {
      const duetLabels = new Set(
        blocks.filter(b => AEMEATH_DUET_BLOCK_IDS.includes(b.id)).map(b => b.trigger.on ?? b.trigger.attemptOn)
      );
      forcedDetonations += rotation.filter(step => step.type && step.skill && duetLabels.has(`${step.type}:${step.skill}`)).length;
    }
  });

  const threshold = hasAemeath ? AEMEATH_EARLY_DETONATION_THRESHOLD : FUSION_BURST_THRESHOLD;
  const passiveDetonations = totalStackPoints / threshold;
  return {
    passiveDetonations,
    forcedDetonations,
    totalDetonations: passiveDetonations + forcedDetonations,
    totalStackPoints,
  };
}
