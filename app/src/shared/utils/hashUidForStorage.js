// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/hashUidForStorage.js (extracted from App.jsx)
// P13-FIX: HIGH-5 - Hash UIDs before writing to Firebase to protect player privacy.
// Game UIDs can potentially be correlated to real identities; hashing makes stored data pseudonymous.
// ═══════════════════════════════════════════════════════════════════════════════

export const hashUidForStorage = async (uid) => {
  if (!uid) return null;

  // Try Web Crypto first (HTTPS only)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ww-uid-' + uid));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    } catch {
      // Sync fallback - don't expose raw UID
      const str = 'ww-uid-' + uid;
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
      }
      return hash.toString(16).padStart(8, '0') + str.length.toString(16).padStart(4, '0');
    }
  }

  // Fallback: FNV-1a hash (not cryptographic, but better than raw UID)
  let hash = 0x811c9dc5;
  const str = 'ww-uid-' + uid;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const h1 = (hash >>> 0).toString(16).padStart(8, '0');
  let hash2 = 0x1a2b3c4d;
  for (let i = 0; i < str.length; i++) {
    hash2 ^= str.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x01000193);
  }
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return (h1 + h2 + h1.split('').reverse().join('') + h2.split('').reverse().join('')).slice(0, 32);
};
