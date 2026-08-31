// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/hashUidForStorage.js (extracted from App.jsx)
// P13-FIX: HIGH-5 - Hash UIDs before writing to Firebase to protect player privacy.
// Game UIDs can potentially be correlated to real identities; hashing makes stored data pseudonymous.
// ═══════════════════════════════════════════════════════════════════════════════

export const hashUidForStorage = async (uid) => {
  if (!uid) return null;

  // Web Crypto (SHA-256) is required — it's only unavailable in a non-HTTPS
  // context, where we must not fall back to a weak, reversible hash and
  // silently upload a de-anonymizable UID to the public leaderboard instead.
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Secure hashing unavailable (requires HTTPS) — cannot safely store UID');
  }

  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ww-uid-' + uid));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
};
