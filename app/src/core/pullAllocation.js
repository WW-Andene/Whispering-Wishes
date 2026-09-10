// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/pullAllocation.js
// Splits the Calculator tab's currency inputs (Astrite/Lunite/tides) into a
// per-banner pull count. Extracted out of CalculatorTab.jsx's own
// astriteAllocation memo so PlannerTab.jsx can compute the exact same
// per-banner pull totals — the two tabs disagreeing on "how many pulls do I
// have for the character banner" was a real, reported bug (2026-09-10).
// ═══════════════════════════════════════════════════════════════════════════════

import { ASTRITE_PER_PULL } from '../data/constants.js';

// calc: the relevant slice of state.calc (astrite, lunite, radiant, forging,
// lustrous, selectedBanner, allocPriority, stdAllocPriority).
function computePullAllocation(calc) {
  const totalAstrite = (+calc.astrite || 0) + (+calc.lunite || 0); // Lunite converts to Astrite 1:1
  const totalPulls = Math.floor(totalAstrite / ASTRITE_PER_PULL);
  const radiant = +calc.radiant || 0;
  const forging = +calc.forging || 0;
  const lustrous = +calc.lustrous || 0;

  if (calc.selectedBanner !== 'both') {
    // Single banner mode - all resources go to that banner
    return {
      charAstritePulls: totalPulls,
      weapAstritePulls: totalPulls,
      charTotal: totalPulls + radiant,
      weapTotal: totalPulls + forging,
      stdCharTotal: totalPulls + lustrous,
      stdWeapTotal: totalPulls + lustrous,
      charPercent: 100,
      weapPercent: 100,
      stdCharAstrite: totalPulls,
      stdWeapAstrite: totalPulls,
      stdCharLustrous: lustrous,
      stdWeapLustrous: lustrous,
    };
  }

  // "Both" mode - split resources based on priority (0-100)
  // 0 = all weapon, 50 = balanced, 100 = all char
  const featPriority = typeof calc.allocPriority === 'number' ? calc.allocPriority : 50;
  const stdPriority = typeof calc.stdAllocPriority === 'number' ? calc.stdAllocPriority : 50;
  const charPercent = featPriority;
  const weapPercent = 100 - featPriority;

  const charAstritePulls = Math.floor(totalPulls * (charPercent / 100));
  const weapAstritePulls = totalPulls - charAstritePulls;

  // Standard banners use their own independent priority
  const stdCharPercent = stdPriority;
  const stdCharLustrous = Math.floor(lustrous * (stdCharPercent / 100));
  const stdWeapLustrous = lustrous - stdCharLustrous;

  // Standard Astrite split uses standard priority
  const stdCharAstrite = Math.floor(totalPulls * (stdCharPercent / 100));
  const stdWeapAstrite = totalPulls - stdCharAstrite;

  return {
    charAstritePulls,
    weapAstritePulls,
    charTotal: charAstritePulls + radiant,
    weapTotal: weapAstritePulls + forging,
    stdCharTotal: stdCharAstrite + stdCharLustrous,
    stdWeapTotal: stdWeapAstrite + stdWeapLustrous,
    charPercent,
    weapPercent,
    stdCharAstrite,
    stdWeapAstrite,
    stdCharLustrous,
    stdWeapLustrous,
  };
}

export { computePullAllocation };
