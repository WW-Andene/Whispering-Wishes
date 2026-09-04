// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/math/roleMatch.js
// [MATH · ROLE-MATCH] Role-substring matching: some characters carry a compound role
// string ('Support/Healer' — Chisa, Suisui) rather than a single 'Healer'/'Support'
// tag. Use these substring checks everywhere a role CATEGORY is being tested,
// instead of an exact `role === 'Healer'`/`role === 'Support'` check, so a compound
// role matches every category it actually belongs to.
//
// Layer: 2 (shared math primitives), engine rewrite. Formerly engine/shared/roleHelpers.js.
// ═══════════════════════════════════════════════════════════════════════════════

export function isHealerRole(role) { return (role || '').includes('Healer'); }
export function isSupportRole(role) { return (role || '').includes('Support'); }
