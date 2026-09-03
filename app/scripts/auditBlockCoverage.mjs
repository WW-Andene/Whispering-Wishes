// Cross-references every character's legacy flat-table data against its TriggerBlocks file for the
// invariants that actually matter for engine correctness:
//   1. Every CHARACTER_ROTATIONS step (the REAL modeled rotation, unlike SKILL_MULTIPLIERS which is
//      the full Kit-tab reference table including moves never used in the modeled combo) has a
//      matching block — an unmatched step is a real silent-0-DMG risk, the exact bug class already
//      found and fixed for Roccia/Yinlin/etc. this session.
//   2. Every RESONANCE_CHAIN_DATA sN node with a real (non-empty, non-zero) value has a chain.sN block.
//   3. Every CHAR_BUFF_TABLE entry (outroBuffs/libBuffs/selfBuffs/debuffs) has SOME block whose
//      effects reproduce it — either a flat same-value match, or a stacking block whose
//      value*maxStacks equals it (the established "per-stack stacking" convention used throughout).
// Read-only, no data changed.
import { CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, CHAR_BUFF_TABLE } from '../src/data/characters.js';
import { BLOCKS_BY_CHARACTER } from '../src/engine/characterBlocks/index.js';

const names = Object.keys(CHARACTER_DATA).filter(n => n !== 'Jingran');
let totalIssues = 0;
const report = [];

function stepIsNonPower(step) {
  // Echo steps have no SKILL_MULTIPLIERS/block of their own (the equipped Echo's own kit provides the
  // damage, tracked separately) — not a gap in THIS character's own blocks.
  return step.type === 'Echo';
}

for (const name of names) {
  const blocks = BLOCKS_BY_CHARACTER[name];
  const issues = [];
  if (!blocks) {
    issues.push('NO BLOCKS FILE AT ALL');
    report.push({ name, issues });
    totalIssues += issues.length;
    continue;
  }

  const rotation = CHARACTER_ROTATIONS[name] || [];
  const triggerOns = new Set(blocks.map(b => b.trigger?.on).filter(Boolean));
  const resourceStepOns = new Set(blocks.map(b => b.trigger?.resourceStepOn).filter(Boolean));
  const hasSwapIn = blocks.some(b => b.trigger?.type === 'swap-in');
  const hasSwapOut = blocks.some(b => b.trigger?.type === 'swap-out');

  for (const step of rotation) {
    if (stepIsNonPower(step)) continue;
    const key = `${step.type}:${step.skill}`;
    const hasCastMatch = triggerOns.has(key);
    const hasResourceMatch = resourceStepOns.has(key);
    const hasIntroSwapMatch = step.type === 'Intro' && hasSwapIn;
    const hasOutroSwapMatch = step.type === 'Outro' && hasSwapOut;
    if (!hasCastMatch && !hasResourceMatch && !hasIntroSwapMatch && !hasOutroSwapMatch) {
      issues.push(`ROTATION STEP unmatched: ${key}`);
    }
  }

  const rc = RESONANCE_CHAIN_DATA[name];
  if (rc) {
    for (let s = 1; s <= 6; s++) {
      const node = rc[`s${s}`];
      const hasRealValue = node && Object.keys(node).length > 0 && !(Object.keys(node).length === 1 && node.totalMult === 0);
      const hasBlock = blocks.some(b => new RegExp(`\\.chain\\.s${s}(-|$)`).test(b.id));
      if (hasRealValue && !hasBlock) {
        issues.push(`RESONANCE_CHAIN s${s} has real value ${JSON.stringify(node)} but no chain.s${s} block`);
      }
    }
  }

  const cbt = CHAR_BUFF_TABLE[name];
  if (cbt) {
    for (const group of ['outroBuffs', 'libBuffs', 'selfBuffs', 'debuffs']) {
      for (const entry of cbt[group] || []) {
        const covered = blocks.some(b => (b.effects || []).some(e => {
          if (e.stat !== entry.stat) return false;
          if (e.value === entry.value) return true;
          if (e.stacking === 'stacking' && e.maxStacks && Math.abs(e.value * e.maxStacks - entry.value) < 0.01) return true;
          return false;
        }));
        if (!covered) {
          issues.push(`CHAR_BUFF_TABLE.${group} entry unmatched: ${entry.stat}=${entry.value}`);
        }
      }
    }
  }

  if (issues.length) {
    report.push({ name, issues });
    totalIssues += issues.length;
  }
}

console.log(`Checked ${names.length} characters. ${report.length} have at least one flagged item. Total flags: ${totalIssues}\n`);
for (const { name, issues } of report) {
  console.log(`### ${name} (${issues.length})`);
  for (const i of issues) console.log(`  - ${i}`);
}
