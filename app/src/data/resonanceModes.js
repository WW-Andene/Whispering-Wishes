// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/resonanceModes.js
// Real, in-game manual Resonance Mode toggle — every dual-mode character (Lynae, Denia, Aemeath)
// has this as a literal switch in their own build/kit panel, available only outside combat. It is
// NOT auto-derived from her own kit numbers, and it is NOT set by team composition either — the
// player picks it, and the game counts damage as-is regardless of who else is on the team (direct
// user correction, 2026-09-05: "in the game... there is a toggle to switch... it's not automatic...
// everything is independent until it's not").
//
// Values are the EXACT `condition.requiresStance`/`dotApplier.requiresStance` strings each
// character's own block file already uses — this file is purely a UI-facing catalog (which options
// exist, and which one the build panel defaults to), never a second source of truth for the strings
// themselves. Order matters: index 0 is the default a fresh/unconfigured build starts on, per the
// user's own instruction ("the mode by default always the first one in the build").
//
// Only characters with a REAL, sourced two-mode kit belong here — e.g. Mornye's Wide Field
// Observation Mode is a state her own actions trigger her into, not a player-picked rival mode, so
// she's deliberately absent (confirmed with the user, 2026-09-05).
// ═══════════════════════════════════════════════════════════════════════════════

export const RESONANCE_MODE_OPTIONS = {
  Lynae: ['Tune Rupture mode', 'Tune Strain mode'],
  Denia: ['Fusion Burst mode', 'Tune Strain mode'],
  Aemeath: ['Tune Rupture mode', 'Fusion Burst mode'],
};

export function hasResonanceModeToggle(charName) {
  return Object.prototype.hasOwnProperty.call(RESONANCE_MODE_OPTIONS, charName);
}

export function defaultResonanceMode(charName) {
  return RESONANCE_MODE_OPTIONS[charName]?.[0] ?? null;
}
