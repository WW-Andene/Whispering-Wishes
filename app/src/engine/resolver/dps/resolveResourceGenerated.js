// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dps/resolveResourceGenerated.js
// [RESOLVER · DPS] Real, named-resource generation over a modeled rotation — the
// generic form of resolveConcertoEnergy.js's own resolveConcertoEnergyGenerated(),
// for a character-specific gauge (e.g. Aemeath's own "Synchronization Rate"/
// "Resonance Rate" — see block.schema.js's `resourceGain` doc). One resource per
// call, since a character's own multiple gauges (e.g. Aemeath has two) are
// independent totals, not meant to be summed together.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @param {import('../../schema/block.schema.js').TriggerBlock[]} blocks
 * @param {{type: string, skill?: string}[]} rotation  CHARACTER_ROTATIONS[charName], walked in order.
 * @param {string} resourceName  Must match a `resourceGain[].resource` string exactly.
 * @returns {{ total: number, perStep: {type: string, skill: string, gain: number}[] }}
 */
export function resolveResourceGenerated(blocks, rotation, resourceName) {
  const castBlocks = blocks.filter(b => b.trigger.type === 'cast' && b.trigger.on && b.resourceGain?.some(rg => rg.resource === resourceName));
  const perStep = [];
  let total = 0;
  for (const step of rotation || []) {
    if (!step.type || !step.skill) continue;
    const label = `${step.type}:${step.skill}`;
    const matches = castBlocks.filter(b => b.trigger.on === label);
    if (!matches.length) continue;
    const gain = matches.reduce((sum, b) => sum + b.resourceGain.filter(rg => rg.resource === resourceName).reduce((s, rg) => s + rg.value, 0), 0);
    if (gain === 0) continue;
    total += gain;
    perStep.push({ type: step.type, skill: step.skill, gain });
  }
  return { total, perStep };
}
