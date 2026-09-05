// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dot/resolveBetweenTheStars.js
// [RESOLVER · TEAM-COMPOSITION] Aemeath's Inherent Skill "Between the Stars" — a real,
// team-composition-dependent stack count, previously modeled as a flat "max value assumed" block
// (aemeath.selfbuff.between-the-stars-critdmg, always +60% Crit DMG regardless of team) plus a
// second block gated on `condition.requiresStance: 'Max Between the Stars stacks'`, a string
// conditionHolds() never recognizes — meaning that second block was silently dead (never fired) on
// every existing path.
//
// Real mechanic (Data dump/Aemeath/Aemeath.md line 108): in Tune Rupture mode, EVERY teammate
// (never Aemeath herself) who inflicts Tune Rupture-Shifting or deals Tune Rupture DMG grants her
// +20% Crit DMG, once per resonator, up to 3 stacks; at 3/3, Heavenfall Edict: Finale DMG is
// Amplified +25%. In Fusion Burst mode: teammates inflicting Fusion Burst grant +30% Crit DMG, once
// per resonator, up to 2 stacks; at 2/2, the same +25% Finale Amp. "Once per resonator" — this is a
// real per-TEAMMATE count (excluding Aemeath), not a per-hit/per-cast one, so it needs the whole
// team's own blocksByOwner, not anything a single character's own block file can see.
//
// A teammate "counts" if the currently-resolved Resonance Mode DOESN'T stop them: their own block
// set carries the matching real marker — `appliesTags` tag 'tune-rupture-shifting' (Tune mode) or
// 'fusion-burst'/`dotApplier.mechanic === 'fusionBurst'` (Fusion mode) — and that marker's own
// `requiresStance` (if any) matches THEIR OWN resolved stance (via winningStanceForOwner, so a
// dual-mode teammate like Lynae/Denia is checked against whichever mode SHE is actually in, not
// Aemeath's).
// ═══════════════════════════════════════════════════════════════════════════════

import { winningStanceForOwner } from '../gating/sequenceGating.js';

const STACK_CONFIG = {
  'Tune Rupture mode': { tag: 'tune-rupture-shifting', dotMechanic: null, perStack: 20, cap: 3 },
  'Fusion Burst mode': { tag: 'fusion-burst', dotMechanic: 'fusionBurst', perStack: 30, cap: 2 },
};

/**
 * @param {Object<string, import('../../schema/block.schema.js').TriggerBlock[]>} blocksByOwner
 * @param {string} aemeathMode  Her own resolved Resonance Mode ('Tune Rupture mode' | 'Fusion Burst mode').
 * @param {Object<string,string>|null} [stanceOverrides]  Manual/forced stances for OTHER teammates
 *   (same shape calcTeamStats.js's own resonanceModeByOwner already builds) — a dual-mode teammate's
 *   own contribution is checked against her real resolved mode, not guessed.
 * @returns {{ stacks: number, cap: number, critDmg: number, maxStacks: boolean, contributors: string[] }}
 */
export function resolveBetweenTheStarsStacks(blocksByOwner, aemeathMode, stanceOverrides = null) {
  const config = STACK_CONFIG[aemeathMode];
  if (!config || !blocksByOwner) return { stacks: 0, cap: 0, critDmg: 0, maxStacks: false, contributors: [] };
  const allBlocks = Object.values(blocksByOwner).flat();
  const contributors = new Set();
  Object.entries(blocksByOwner).forEach(([owner, blocks]) => {
    if (owner === 'Aemeath') return;
    const stance = winningStanceForOwner(allBlocks, owner, stanceOverrides?.[owner] ?? null);
    const applies = blocks.some(b => {
      const tagHit = (b.appliesTags || []).some(t => {
        const tagName = typeof t === 'string' ? t : t.tag;
        if (tagName !== config.tag) return false;
        const req = typeof t === 'string' ? null : t.requiresStance;
        return req == null || req === stance;
      });
      if (tagHit) return true;
      if (config.dotMechanic && b.dotApplier?.mechanic === config.dotMechanic) {
        const req = b.dotApplier.requiresStance;
        return req == null || req === stance;
      }
      return false;
    });
    if (applies) contributors.add(owner);
  });
  const stacks = Math.min(config.cap, contributors.size);
  return {
    stacks,
    cap: config.cap,
    critDmg: stacks * config.perStack,
    maxStacks: config.cap > 0 && stacks === config.cap,
    contributors: [...contributors],
  };
}
