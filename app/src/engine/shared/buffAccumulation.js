// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/shared/buffAccumulation.js
// The dpsFocus-gated Logic helper for collapsing move-type-specific %DMG-bonus
// accumulators (basicDmg/heavyDmg/libDmg/echoDmg/coordDmg) into the single skillDmg
// bucket the WuWa 3-layer DMG bonus formula (calcDmgBonus) expects.
//
// Relocated from app/src/features/teams/calcEngine.js's `routeTypeBonuses` as part of
// the Phase 0 structural cleanup, per ENGINE_ARCHITECTURE_PROPOSAL.md v2 §5 — a
// relocation-and-rename, NOT a behavior change. Renamed `collapseDmgTypeBuckets`
// because that's what the function does (collapse move-type buckets into one, gated
// by dpsFocus) — the old name `routeTypeBonuses` read as generic damage-type routing
// and invited the v1 proposal's mistaken assumption that it operated on realized
// damage amounts rather than received %-bonus stat accumulators (see §5's post-mortem
// in the proposal doc). Byte-identical logic to the original routeTypeBonuses.
//
// calcEngine.js re-exports this under both names (`collapseDmgTypeBuckets` and the
// legacy `routeTypeBonuses`) so its three existing call sites in calcTeamStats.js
// (RAW-tier Jingran fallback, legacy FULL-tier flat-table path, and the main-DPS
// stat-panel branch now wrapped by engine/projection/statPanelProjection.js) keep
// working with zero call-site changes.
// ═══════════════════════════════════════════════════════════════════════════════

export function collapseDmgTypeBuckets(stats, dpsFocus) {
  // stats.skillDmg arrives holding whatever literal "Resonance Skill DMG%" contributions were
  // accumulated before this call (weapon passive, echo set, self-buffs, resonance chain — the same
  // "raw pool, gated on the way in" pattern basicDmg/heavyDmg/libDmg/echoDmg/coordDmg already use
  // below). Unlike those siblings it was never actually gated by dpsFocus — a character with no
  // 'Skill' in their focus (e.g. a pure Heavy ATK/Liberation DPS) still got full credit for a
  // Resonance-Skill-specific bonus as if it applied to their whole rotation. Zero it here first, same
  // "defined focus, not this type" rule as every other type.
  if (!dpsFocus.includes('Skill')) stats.skillDmg = 0;
  if (dpsFocus.includes('Basic ATK')) stats.skillDmg += stats.basicDmg;
  else if (stats.basicDmg > 0 && !dpsFocus.length) stats.skillDmg += stats.basicDmg * 0.5;
  if (dpsFocus.includes('Heavy ATK')) stats.skillDmg += stats.heavyDmg;
  else if (stats.heavyDmg > 0 && !dpsFocus.length) stats.skillDmg += stats.heavyDmg * 0.5;
  if (dpsFocus.includes('Liberation')) stats.skillDmg += stats.libDmg;
  else if (stats.libDmg > 0 && !dpsFocus.length) stats.skillDmg += stats.libDmg * 0.3;
  if (dpsFocus.includes('Echo')) stats.skillDmg += stats.echoDmg;
  if (dpsFocus.includes('Coordinated ATK')) stats.skillDmg += stats.coordDmg;
}
