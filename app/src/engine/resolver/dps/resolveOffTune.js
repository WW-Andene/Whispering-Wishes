// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dps/resolveOffTune.js
// [RESOLVER · DPS] Real Off-Tune gauge accumulation over a modeled rotation, using
// offTuneFormula.js's sourced section-range midpoints — see
// `Data dump/Mechanic/damage-and-tune-mechanics.md` §2a for the full sourcing and
// its own explicit "these are approximated within a sourced range" caveat.
//
// Single-character scope only, same as resolveConcertoEnergy.js — a real team-wide
// version (multiple characters contributing to the SAME enemy's gauge, the way the
// real game's Off-Tune Level actually works) is a larger, cross-character resolver
// change, not built here. This answers "how much Off-Tune does THIS character's own
// rotation generate," a real, useful number on its own (e.g. comparing two
// characters' own gauge-fill efficiency), not yet "when does the enemy actually
// break" for a real multi-character team.
// ═══════════════════════════════════════════════════════════════════════════════

import { offTuneValueForBlock } from '../../math/offTuneFormula.js';

/**
 * @param {import('../../schema/block.schema.js').TriggerBlock[]} blocks
 * @param {{type: string, skill?: string}[]} rotation  CHARACTER_ROTATIONS[charName], walked in order.
 * @returns {{ total: number, perStep: {type: string, skill: string, gain: number}[] }}
 */
export function resolveOffTuneGenerated(blocks, rotation) {
  // Fixed 2026-09-06 (real bug, caught cross-checking Aemeath's Off-Tune total against a real
  // rotation by hand): a `windowed-cast`-triggered block (e.g. Aemeath's own Seraphic Duet Encore/
  // Overture — real Seraphic Duo window gating built earlier this session) has no `trigger.on`, its
  // match label lives in `trigger.attemptOn` instead. The old `trigger.type === 'cast' && trigger.on`
  // filter silently excluded every such block — for Aemeath specifically, this dropped BOTH her real
  // Duet casts (10 Off-Tune each, `section: 'Skill'`) from her own total entirely, understating it
  // by 20 and shifting exactly when her real Tune Break detonation fires.
  const castBlocks = blocks.filter(b => (b.trigger.type === 'cast' || b.trigger.type === 'windowed-cast') && (b.trigger.on ?? b.trigger.attemptOn));
  const perStep = [];
  let total = 0;
  for (const step of rotation || []) {
    if (!step.type || !step.skill) continue;
    const label = `${step.type}:${step.skill}`;
    const matches = castBlocks.filter(b => (b.trigger.on ?? b.trigger.attemptOn) === label);
    if (!matches.length) continue;
    // ONE real cast = ONE Off-Tune contribution, regardless of how many separate TriggerBlocks
    // this schema splits that single cast into (e.g. a damage block plus a same-cast-triggered
    // buff block, like Aalto's Liberation carrying both its damage AND its Gate ATK buff on the
    // same trigger.on) — summing across all of them would double-count one real move. Prefer the
    // 'damage'-kind block (the one that actually represents the move's own hit) when present.
    const representative = matches.find(b => b.kind === 'damage') || matches[0];
    const gain = offTuneValueForBlock(representative);
    if (gain === 0) continue;
    total += gain;
    perStep.push({ type: step.type, skill: step.skill, gain });
  }
  return { total, perStep };
}
