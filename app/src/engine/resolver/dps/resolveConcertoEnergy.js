// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dps/resolveConcertoEnergy.js
// [RESOLVER · DPS] Real Concerto Energy generated over a modeled rotation, summed
// from each fired 'cast' block's own sourced `damage.concertoEnergyGain` (or, for a
// buff-kind cast block, `concertoEnergyGain` at the block's top level — see
// block.schema.js's own doc for why this lives on the block, not inside `effects`:
// it isn't a %-modifier, it's a discrete per-cast resource gain).
//
// This does NOT gate Outro timing — CHARACTER_ROTATIONS' own explicit 'Outro' step
// still drives that (see rotationSimulator.js's deriveStepsFromRotation doc). It
// exists so a real, sourced Concerto value (e.g. Aalto's Skill+15/Liberation+20/
// Intro+10) is an actual computed number the engine derives, not documentation-only
// text sitting inert in a `note` field with nothing reading it.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @param {import('../../schema/block.schema.js').TriggerBlock[]} blocks
 * @param {{type: string, skill?: string}[]} rotation  CHARACTER_ROTATIONS[charName] — walked in
 *   order, one accumulation pass per step (a step whose TYPE:SKILL matches more than one block
 *   with concertoEnergyGain sums all of them, same as damage resolution elsewhere in this engine).
 * @returns {{ total: number, perStep: {type: string, skill: string, gain: number}[] }}
 */
export function resolveConcertoEnergyGenerated(blocks, rotation) {
  const castBlocks = blocks.filter(b => b.trigger.type === 'cast' && b.trigger.on && b.concertoEnergyGain != null);
  const perStep = [];
  let total = 0;
  for (const step of rotation || []) {
    if (!step.type || !step.skill) continue;
    const label = `${step.type}:${step.skill}`;
    const matches = castBlocks.filter(b => b.trigger.on === label);
    if (!matches.length) continue;
    const gain = matches.reduce((sum, b) => sum + b.concertoEnergyGain, 0);
    total += gain;
    perStep.push({ type: step.type, skill: step.skill, gain });
  }
  return { total, perStep };
}
