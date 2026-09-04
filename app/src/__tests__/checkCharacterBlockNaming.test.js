import { describe, it, expect } from 'vitest';
import { checkCharacterBlockNaming } from '../../scripts/checkCharacterBlockNaming.js';

// ENGINE_ARCHITECTURE_PROPOSAL.md v2 §4.2/§8 item 2's naming CI check, run as part of the normal
// suite. Deliberately NOT asserting zero violations: two real characterBlocks/ filename
// inconsistencies exist today (roverElectro.blocks.js's camelCase, per §0.3; and
// xianglyao.blocks.js vs. "Xiangli Yao"'s slug xiangliyao.blocks.js, found independently while
// building this checker — not named in the proposal's own §0.3 inventory) and fixing either
// requires renaming a file INSIDE characterBlocks/, which this Phase 0 pass's scope explicitly
// defers to the Phase A-integrated migration (§7), not silently works around here. This test
// instead locks the CURRENT, known violation list so the checker itself is verified working (would
// fail loudly if the list grows, shrinks unexpectedly, or the parser breaks against a future
// index.js edit) without prematurely asserting a level of compliance this pass didn't reach.
describe('checkCharacterBlockNaming — CI naming check (informational in this pass, not enforced)', () => {
  it('reports exactly the known, already-flagged violations and no others', () => {
    const violations = checkCharacterBlockNaming();
    expect(violations).toHaveLength(2);
    expect(violations.some(v => v.includes('roverElectro'))).toBe(true);
    expect(violations.some(v => v.includes('Xiangli Yao'))).toBe(true);
  });
});
