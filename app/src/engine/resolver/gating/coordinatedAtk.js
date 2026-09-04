// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/gating/coordinatedAtk.js
// [RESOLVER · GATING] Coordinated ATK off-field snapshot gating.
// PHASE3_PLAN.md Stage 3, item 4/5 (final item): closes the "Coordinated ATK off-field snapshot
// semantics" gap from Stage 0's coverage table. calcTeamStats.js models two SEPARATE mechanics under
// this name, duplicated verbatim between its RAW tier (calcTeamStats.js:531-540) and FULL tier
// (calcTeamStats.js:984-993, :1024-1090) — this file gives each its own reusable, engine-composable
// piece rather than porting the duplication itself:
//
// 1. THE COORD/FIELD-TIME MULT SPLIT — a Coordinated ATK sub-DPS's own damage-share is a blend of
//    "coordinated" output (scales with the MAIN DPS's own on-field uptime, since Coordinated ATK
//    fires off-field alongside them) and ordinary on-field output (scales with this sub-DPS's own
//    allocated field-time ratio, same as any other sub-DPS). `coordinatedMultShare()` below is that
//    exact blend, factored out so Stage 4 doesn't have to re-derive or re-duplicate it a third time.
//
// 2. THE BUFF-SNAPSHOT DISCOUNT — an off-field Coordinated ATK character doesn't linearly receive
//    every OTHER teammate's outro-style buff the way an on-field character does: a support who swaps
//    in AFTER them in rotation order never actually reaches them (they already left), so legacy applies
//    a flat 0.6 "snapshot" discount specifically to buffs targeted 'next' (calcTeamStats.js:1046-1052)
//    — NOT to whole-team/continuous buffs like libBuffs' team target, which persist regardless of swap
//    order and are correctly left undiscounted (calcTeamStats.js:1081-1089 has no snapshotFactor at
//    all). This maps exactly onto the engine's own scope vocabulary: legacy's 'next'-target outro
//    buffs are precisely what `target.scope: 'next-on-field'` already models
//    (resolveSimulatedTeamRotation.js's own file header: "only from a block whose source is the team
//    member IMMEDIATELY BEFORE targetName"), while legacy's undiscounted team-persistent buffs are
//    `target.scope: 'whole-team'`. So the discount only needs to touch 'next-on-field' — see the
//    `coordSnapshotDiscount` opt threaded through resolveSimulatedTeamRotation.js and
//    resolveHitComposedTeamDps.js, not a new mechanism in this file.
// ═══════════════════════════════════════════════════════════════════════════════

/** Legacy's exact snapshot discount (calcTeamStats.js:1050: `isOffField ? 0.6 : 1.0`). */
export const COORD_SNAPSHOT_DISCOUNT = 0.6;

/**
 * The exact mult-share blend calcTeamStats.js applies to a Coordinated ATK sub-DPS, in both its RAW
 * tier (calcTeamStats.js:534-537) and FULL tier (calcTeamStats.js:989-993) — identical formula,
 * factored out here instead of staying duplicated a third time for Stage 4's rewrite.
 *
 * @param {Object} opts
 * @param {number} opts.coordShare  The character's own coordinated-portion share (0-1) — legacy's
 *   `focus.length === 1 ? 0.8 : 0.5` (a pure Coordinated ATK kit vs. a hybrid one that also has real
 *   on-field presence).
 * @param {number} opts.coordUptime  The main DPS's own on-field time as a fraction of the whole
 *   rotation (`Math.min(1, mainOnField / rotTime)`) — the coordinated portion is active whenever the
 *   main DPS is on-field, not tied to this character's own field allocation at all.
 * @param {number} opts.fieldRatio  This character's own ordinary on-field time ratio (same value any
 *   non-coordinated sub-DPS uses) — the non-coordinated remainder of their kit still needs to
 *   actually be on-field to deal damage.
 * @returns {number}  A 0-1 multiplier on the character's own totalMult/damage output.
 */
export function coordinatedMultShare({ coordShare, coordUptime, fieldRatio }) {
  const onFieldShare = 1 - coordShare;
  return coordShare * coordUptime + onFieldShare * fieldRatio;
}
