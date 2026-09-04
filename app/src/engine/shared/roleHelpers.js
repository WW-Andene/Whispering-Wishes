// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/shared/roleHelpers.js
// Role-substring matching: some characters carry a compound role string
// ('Support/Healer' — Chisa, Suisui) rather than a single 'Healer'/'Support' tag.
// Use these substring checks everywhere a role CATEGORY is being tested, instead of
// an exact `role === 'Healer'`/`role === 'Support'` check, so a compound role matches
// every category it actually belongs to.
//
// Relocated from app/src/features/teams/calcEngine.js as part of the Phase 0
// structural cleanup (ENGINE_ARCHITECTURE_PROPOSAL.md v2 §2.1, "shared/roleHelpers.js").
// Byte-identical logic. calcEngine.js re-exports these so existing importers keep
// working unchanged.
// ═══════════════════════════════════════════════════════════════════════════════

export function isHealerRole(role) { return (role || '').includes('Healer'); }
export function isSupportRole(role) { return (role || '').includes('Support'); }
